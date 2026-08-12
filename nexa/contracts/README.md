# PaymentReceiver — Arc Testnet USDC checkout contract

Accepts USDC payments tagged with an off-chain `orderId` and records an
immutable on-chain receipt. Built to be self-contained (no OpenZeppelin
dependency) so it compiles with a bare Foundry install.

## What it does

- `pay(orderId, amount)` — buyer approves USDC, then calls this. Contract
  pulls `amount` USDC from the buyer and stores a `Payment` receipt keyed by
  `orderId`. Reverts if the order was already paid, if `amount` is zero, or
  if `orderId` is zero.
- `getPayment(orderId)` / `isPaidWithAtLeast(orderId, minAmount)` — read
  functions your backend/indexer uses to confirm fulfillment.
- `withdraw(to, amount)` / `sweep(to)` — owner-only, pulls collected USDC out
  to your treasury address.
- `pause()` / `unpause()` — owner-only emergency stop on new payments.

Design choices worth knowing:

- **Funds are held in the contract, not forwarded directly to a store
  address.** This decouples "is this order paid" bookkeeping from custody, so
  rotating your treasury address never invalidates past receipts.
- **Effects before interactions** in `pay()` — the receipt is written and the
  event emitted *before* the external `transferFrom` call, with a
  `nonReentrant` guard on top as defense in depth.
- **Only ever touches the ERC-20 USDC interface**, never native value — this
  matches Arc's own guidance, since native balances use 18 decimals and the
  ERC-20 uses 6.
- **Never trust client-reported amounts.** Your backend should treat the
  `PaymentReceived` event (or `getPayment`) as the source of truth for how
  much was actually paid, not whatever the frontend claims it sent.

## Setup

This was scaffolded without network access, so `forge-std` isn't installed
yet. On your machine, from this directory:

```bash
# if you don't have Foundry yet
curl -L https://foundry.paradigm.xyz | bash
foundryup

forge init --force --no-commit   # wires up the lib/ dir if missing
forge install foundry-rs/forge-std --no-commit

forge build
forge test -vvv
```

The fuzz test (`testFuzz_PayArbitraryAmounts`) runs 256 cases by default —
bump `[fuzz] runs` in `foundry.toml` if you want more.

## Deploy to Arc Testnet

```bash
export ARC_TESTNET_RPC="https://rpc.testnet.arc.network"   # confirm current URL in docs.arc.io
export USDC_ADDRESS="0x3600000000000000000000000000000000000000"
export STORE_OWNER="0xYourTreasuryOrMultisig"
export DEPLOYER_PRIVATE_KEY="0x..."   # funded with testnet USDC for gas via faucet.circle.com

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $ARC_TESTNET_RPC \
  --broadcast \
  --private-key $DEPLOYER_PRIVATE_KEY
```

Then verify on ArcScan (check `docs.arc.io` for the current verify command —
Arc's Etherscan-compatible API details can change):

```bash
forge verify-contract <deployed_address> src/PaymentReceiver.sol:PaymentReceiver \
  --chain-id 5042002 \
  --rpc-url $ARC_TESTNET_RPC \
  --constructor-args $(cast abi-encode "constructor(address,address)" $USDC_ADDRESS $STORE_OWNER)
```

## Wiring into the checkout flow

1. Backend creates a pending order, generates `orderId` (e.g.
   `keccak256(abi.encodePacked(internalOrderId))`), and returns
   `{ orderId, amount }` to the frontend — `amount` in USDC's 6-decimal units
   (`parseUnits(priceString, 6)`).
2. Frontend checks `usdc.allowance(buyer, receiverAddress)`; if insufficient,
   calls `usdc.approve(receiverAddress, amount)`.
3. Frontend calls `receiver.pay(orderId, amount)`.
4. Backend/indexer watches for `PaymentReceived(orderId, buyer, amount, timestamp)`
   — or polls `getPayment(orderId)` — and marks the order paid **only** once
   the on-chain `amount` matches what was quoted. One confirmation is enough
   given Arc's deterministic finality, but confirm the current block-time
   figure in `docs.arc.io` before relying on "1 confirmation ≈ instant" in
   your UI copy.

## Before mainnet

- Get this contract audited — it's small, but it's still money-handling code.
- Consider a timelock or multisig as `owner` rather than an EOA, since
  `owner` can pause the contract and withdraw all collected funds.
- Decide on a refund path (manual `withdraw` + off-chain USDC send back, or a
  dedicated `refund(orderId)` function) before you need one.
