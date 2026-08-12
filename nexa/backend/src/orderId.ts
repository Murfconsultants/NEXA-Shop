import { keccak256, toHex } from "viem";
import { randomUUID } from "crypto";

/**
 * bytes32 order ids are derived from a random UUID rather than an
 * incrementing integer, so an order id never leaks sequence/volume
 * information on-chain.
 */
export function generateOrderId(): `0x${string}` {
  return keccak256(toHex(randomUUID()));
}
