import { BackendOrderStore } from "./db";
import { PaymentIndexer } from "./indexer";

const store = new BackendOrderStore();

const indexer = new PaymentIndexer(store, {
  async onOrderSettled({ orderId, buyer, amount, txHash }) {
    // Order status + fulfillment (confirmation email, etc.) are handled by
    // the backend itself as part of the mark-paid call in BackendOrderStore —
    // this hook is just for indexer-side observability/alerting.
    console.log(`[fulfillment] order ${orderId} paid by ${buyer} (${amount} raw units)`);
    console.log(`[fulfillment] tx: https://testnet.arcscan.app/tx/${txHash}`);
  },
});

process.on("SIGINT", () => {
  console.log("\n[indexer] shutting down");
  indexer.stop();
  process.exit(0);
});

indexer.start();
