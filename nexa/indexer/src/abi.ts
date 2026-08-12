export const paymentReceiverAbi = [
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
