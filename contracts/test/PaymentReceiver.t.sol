// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PaymentReceiver} from "../src/PaymentReceiver.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract PaymentReceiverTest is Test {
    PaymentReceiver receiver;
    MockUSDC usdc;

    address owner = makeAddr("owner");
    address buyer = makeAddr("buyer");
    address treasury = makeAddr("treasury");

    bytes32 constant ORDER_1 = keccak256("order-1");

    function setUp() public {
        usdc = new MockUSDC();
        vm.prank(owner);
        receiver = new PaymentReceiver(address(usdc), owner);

        usdc.mint(buyer, 1_000 * 1e6); // 1,000 USDC, 6 decimals
    }

    function test_PayRecordsReceiptAndPullsFunds() public {
        uint256 amount = 25 * 1e6; // 25 USDC

        vm.startPrank(buyer);
        usdc.approve(address(receiver), amount);

        vm.expectEmit(true, true, false, true);
        emit PaymentReceiver.PaymentReceived(ORDER_1, buyer, amount, block.timestamp);
        receiver.pay(ORDER_1, amount);
        vm.stopPrank();

        PaymentReceiver.Payment memory p = receiver.getPayment(ORDER_1);
        assertEq(p.buyer, buyer);
        assertEq(p.amount, amount);
        assertTrue(p.paid);
        assertEq(usdc.balanceOf(address(receiver)), amount);
        assertEq(receiver.collectedBalance(), amount);
    }

    function test_RevertOnDoublePay() public {
        uint256 amount = 10 * 1e6;
        vm.startPrank(buyer);
        usdc.approve(address(receiver), amount * 2);
        receiver.pay(ORDER_1, amount);

        vm.expectRevert(abi.encodeWithSelector(PaymentReceiver.OrderAlreadyPaid.selector, ORDER_1));
        receiver.pay(ORDER_1, amount);
        vm.stopPrank();
    }

    function test_RevertOnZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert(PaymentReceiver.ZeroAmount.selector);
        receiver.pay(ORDER_1, 0);
    }

    function test_RevertOnZeroOrderId() public {
        vm.prank(buyer);
        vm.expectRevert(PaymentReceiver.ZeroOrderId.selector);
        receiver.pay(bytes32(0), 1e6);
    }

    function test_RevertWithoutApproval() public {
        vm.prank(buyer);
        vm.expectRevert(bytes("MockUSDC: insufficient allowance"));
        receiver.pay(ORDER_1, 1e6);
    }

    function test_RevertWhenPaused() public {
        vm.prank(owner);
        receiver.pause();

        vm.startPrank(buyer);
        usdc.approve(address(receiver), 1e6);
        vm.expectRevert("PaymentReceiver: paused");
        receiver.pay(ORDER_1, 1e6);
        vm.stopPrank();
    }

    function test_OwnerCanWithdraw() public {
        uint256 amount = 50 * 1e6;
        vm.startPrank(buyer);
        usdc.approve(address(receiver), amount);
        receiver.pay(ORDER_1, amount);
        vm.stopPrank();

        vm.prank(owner);
        receiver.withdraw(treasury, amount);

        assertEq(usdc.balanceOf(treasury), amount);
        assertEq(receiver.collectedBalance(), 0);
    }

    function test_RevertWithdrawByNonOwner() public {
        vm.prank(buyer);
        vm.expectRevert("PaymentReceiver: caller is not the owner");
        receiver.withdraw(treasury, 1);
    }

    function test_RevertWithdrawMoreThanCollected() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(PaymentReceiver.InsufficientContractBalance.selector, 1e6, 0)
        );
        receiver.withdraw(treasury, 1e6);
    }

    function test_IsPaidWithAtLeast() public {
        uint256 amount = 25 * 1e6;
        vm.startPrank(buyer);
        usdc.approve(address(receiver), amount);
        receiver.pay(ORDER_1, amount);
        vm.stopPrank();

        assertTrue(receiver.isPaidWithAtLeast(ORDER_1, amount));
        assertTrue(receiver.isPaidWithAtLeast(ORDER_1, amount - 1));
        assertFalse(receiver.isPaidWithAtLeast(ORDER_1, amount + 1));
        assertFalse(receiver.isPaidWithAtLeast(keccak256("unknown"), 1));
    }

    function test_Sweep() public {
        // Simulate a direct transfer that bypasses pay() entirely.
        usdc.mint(address(receiver), 5 * 1e6);

        vm.prank(owner);
        receiver.sweep(treasury);

        assertEq(usdc.balanceOf(treasury), 5 * 1e6);
        assertEq(receiver.collectedBalance(), 0);
    }

    function testFuzz_PayArbitraryAmounts(uint96 rawAmount) public {
        uint256 amount = bound(rawAmount, 1, 1_000 * 1e6);
        usdc.mint(buyer, amount);

        vm.startPrank(buyer);
        usdc.approve(address(receiver), amount);
        receiver.pay(keccak256(abi.encode(amount)), amount);
        vm.stopPrank();

        assertEq(receiver.collectedBalance(), amount);
    }
}
