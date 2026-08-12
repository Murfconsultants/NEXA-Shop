/**
 * Arc's native USDC ERC-20 interface. Shares the same underlying balance as
 * the native gas token, but exposes standard ERC-20 methods at 6 decimals —
 * use this address for all application-level transfers/approvals/balances.
 * Confirm against https://docs.arc.io/arc/references/contract-addresses.
 */
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  "0x3600000000000000000000000000000000000000") as `0x${string}`;

export const USDC_DECIMALS = 6;

/** Deployed address of PaymentReceiver.sol — set after running the deploy script. */
export const PAYMENT_RECEIVER_ADDRESS = process.env
  .NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as `0x${string}`;

export const usdcAbi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

/** Only the functions/events the frontend actually calls — trim from the full ABI. */
export const paymentReceiverAbi = [
  {
    type: "function",
    name: "pay",
    stateMutability: "nonpayable",
    inputs: [
      { name: "orderId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getPayment",
    stateMutability: "view",
    inputs: [{ name: "orderId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "buyer", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint64" },
          { name: "paid", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "PaymentReceived",
    inputs: [
      { name: "orderId", type: "bytes32", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
