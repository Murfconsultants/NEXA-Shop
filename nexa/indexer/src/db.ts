import { promises as fs } from "fs";
import path from "path";
import { config } from "./config";

export interface OrderRecord {
  orderId: `0x${string}`;
  expectedAmount: bigint;
  status: "pending" | "paid" | "underpaid" | "overpaid" | "cancelled";
}

export interface OrderStore {
  getOrder(orderId: `0x${string}`): Promise<OrderRecord | null>;
  markPaid(args: {
    orderId: `0x${string}`;
    buyer: `0x${string}`;
    paidAmount: bigint;
    txHash: `0x${string}`;
    blockNumber: bigint;
  }): Promise<void>;
  hasProcessedTx(txHash: `0x${string}`): Promise<boolean>;
  getCursor(): Promise<bigint | null>;
  setCursor(blockNumber: bigint): Promise<void>;
}

interface ProgressShape {
  processedTxHashes: string[];
  cursor: string | null;
}

/**
 * BackendOrderStore treats the backend API (arc-backend) as the single
 * source of truth for order data — getOrder/markPaid are plain HTTP calls.
 * Indexer-local *progress* (which block we've scanned to, which tx hashes
 * we've already applied) is tracked separately in a small local file, since
 * that's this process's own bookkeeping, not order truth.
 */
export class BackendOrderStore implements OrderStore {
  constructor(private readonly progressFilePath: string = path.join(process.cwd(), "progress.json")) {}

  private async readProgress(): Promise<ProgressShape> {
    try {
      const raw = await fs.readFile(this.progressFilePath, "utf-8");
      return JSON.parse(raw) as ProgressShape;
    } catch {
      return { processedTxHashes: [], cursor: null };
    }
  }

  private async writeProgress(data: ProgressShape): Promise<void> {
    await fs.writeFile(this.progressFilePath, JSON.stringify(data, null, 2));
  }

  async getOrder(orderId: `0x${string}`): Promise<OrderRecord | null> {
    const res = await fetch(`${config.backendUrl}/api/orders/${orderId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Backend getOrder failed: ${res.status} ${await res.text()}`);
    const order = await res.json();
    return { orderId: order.id, expectedAmount: BigInt(order.amount), status: order.status };
  }

  async markPaid(args: {
    orderId: `0x${string}`;
    buyer: `0x${string}`;
    paidAmount: bigint;
    txHash: `0x${string}`;
    blockNumber: bigint;
  }): Promise<void> {
    const res = await fetch(`${config.backendUrl}/api/orders/${args.orderId}/mark-paid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.indexerApiKey,
      },
      body: JSON.stringify({
        buyer: args.buyer,
        amount: args.paidAmount.toString(),
        txHash: args.txHash,
        blockNumber: args.blockNumber.toString(),
      }),
    });
    if (!res.ok) {
      throw new Error(`Backend mark-paid failed: ${res.status} ${await res.text()}`);
    }

    const progress = await this.readProgress();
    progress.processedTxHashes.push(args.txHash);
    await this.writeProgress(progress);
  }

  async hasProcessedTx(txHash: `0x${string}`): Promise<boolean> {
    const progress = await this.readProgress();
    return progress.processedTxHashes.includes(txHash);
  }

  async getCursor(): Promise<bigint | null> {
    const progress = await this.readProgress();
    return progress.cursor ? BigInt(progress.cursor) : null;
  }

  async setCursor(blockNumber: bigint): Promise<void> {
    const progress = await this.readProgress();
    progress.cursor = blockNumber.toString();
    await this.writeProgress(progress);
  }
}
