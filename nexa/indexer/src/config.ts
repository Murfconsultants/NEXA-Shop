import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  rpcUrl: required("ARC_RPC_URL"),
  paymentReceiverAddress: required("PAYMENT_RECEIVER_ADDRESS") as `0x${string}`,
  // Number of blocks to wait past a PaymentReceived log before treating it as
  // final. Arc advertises deterministic sub-second/low-second finality, but
  // confirm the current figure in docs.arc.io before trusting 1 block in prod.
  confirmations: Number(process.env.CONFIRMATIONS ?? 1),
  // How often to poll for new blocks.
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 3_000),
  // Block to start indexing from if we have no prior progress on record —
  // set this to the deployment block of PaymentReceiver to avoid scanning from genesis.
  startBlock: BigInt(process.env.START_BLOCK ?? "0"),
  maxBlockRange: BigInt(process.env.MAX_BLOCK_RANGE ?? "2000"),
  chunkDelayMs: Number(process.env.CHUNK_DELAY_MS ?? "300"),
  // The backend API this indexer reports settled payments to.
  backendUrl: required("BACKEND_URL"),
  indexerApiKey: required("INDEXER_API_KEY"),
};
