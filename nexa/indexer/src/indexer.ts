import { createPublicClient, http, parseAbiItem } from "viem";
import { config } from "./config";
import type { OrderStore } from "./db";
import { arcTestnet } from "./chain";

const PAYMENT_RECEIVED_EVENT = parseAbiItem(
  "event PaymentReceived(bytes32 indexed orderId, address indexed buyer, uint256 amount, uint256 timestamp)"
);

export interface FulfillmentHooks {
  /** Called once a payment is durably recorded as paid. Wire up email, shipping, digital delivery, etc. here. */
  onOrderSettled(order: {
    orderId: `0x${string}`;
    buyer: `0x${string}`;
    amount: bigint;
    txHash: `0x${string}`;
  }): Promise<void> | void;
}

export class PaymentIndexer {
  private readonly client = createPublicClient({
    chain: arcTestnet,
    transport: http(config.rpcUrl),
  });

  private running = false;

  constructor(
    private readonly store: OrderStore,
    private readonly hooks: FulfillmentHooks
  ) {}

  async start() {
    this.running = true;
    console.log(`[indexer] starting, watching ${config.paymentReceiverAddress}`);

    while (this.running) {
      try {
        await this.tick();
      } catch (err) {
        console.error("[indexer] tick failed:", err);
      }
      await sleep(config.pollIntervalMs);
    }
  }

  stop() {
    this.running = false;
  }

  private async tick() {
    const latest = await this.client.getBlockNumber();
    const safeTip =
      latest > BigInt(config.confirmations) ? latest - BigInt(config.confirmations) : 0n;

    let cursor = await this.store.getCursor();
    if (cursor === null) {
      cursor = config.startBlock;
    }

    if (safeTip <= cursor) return; // nothing new past the confirmation depth yet

    const fromBlock = cursor + 1n;
    const toBlock = safeTip;

    const logs = await this.client.getLogs({
      address: config.paymentReceiverAddress,
      event: PAYMENT_RECEIVED_EVENT,
      fromBlock,
      toBlock,
    });

    console.log(
      `[indexer] scanned blocks ${fromBlock}-${toBlock}, found ${logs.length} payment(s)`
    );

    for (const log of logs) {
      await this.processLog(log);
    }

    await this.store.setCursor(toBlock);
  }

  private async processLog(log: {
    args: { orderId?: `0x${string}`; buyer?: `0x${string}`; amount?: bigint };
    transactionHash: `0x${string}` | null;
    blockNumber: bigint | null;
  }) {
    const { orderId, buyer, amount } = log.args;
    if (!orderId || !buyer || amount === undefined || !log.transactionHash || !log.blockNumber) {
      console.warn("[indexer] skipping malformed log", log);
      return;
    }

    // Idempotency: a restart or an RPC hiccup could redeliver the same log.
    if (await this.store.hasProcessedTx(log.transactionHash)) {
      return;
    }

    const order = await this.store.getOrder(orderId);
    if (!order) {
      // Paid on-chain but unknown to our backend — investigate manually.
      // Could be a stale/malicious orderId, or a race with order creation.
      console.error(`[indexer] payment for unknown order ${orderId} in tx ${log.transactionHash}`);
      return;
    }

    await this.store.markPaid({
      orderId,
      buyer,
      paidAmount: amount,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    });

    if (amount !== order.expectedAmount) {
      console.warn(
        `[indexer] order ${orderId} paid ${amount} but expected ${order.expectedAmount} — flagged, not auto-fulfilling`
      );
      return; // let a human or a separate reconciliation job decide over/underpayment handling
    }

    await this.hooks.onOrderSettled({
      orderId,
      buyer,
      amount,
      txHash: log.transactionHash,
    });
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
