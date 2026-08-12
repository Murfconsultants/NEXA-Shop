// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PaymentReceiver} from "../src/PaymentReceiver.sol";

/// @dev Usage (see README for the full command):
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url $ARC_TESTNET_RPC \
///     --broadcast \
///     --private-key $DEPLOYER_PRIVATE_KEY
///
/// Required env vars:
///   USDC_ADDRESS   - Arc's USDC ERC-20 interface address
///   STORE_OWNER    - address that should own the deployed contract (can withdraw/pause)
contract Deploy is Script {
    function run() external returns (PaymentReceiver receiver) {
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address storeOwner = vm.envAddress("STORE_OWNER");

        vm.startBroadcast();
        receiver = new PaymentReceiver(usdcAddress, storeOwner);
        vm.stopBroadcast();

        console.log("PaymentReceiver deployed at:", address(receiver));
        console.log("USDC token:", usdcAddress);
        console.log("Owner:", storeOwner);
    }
}
