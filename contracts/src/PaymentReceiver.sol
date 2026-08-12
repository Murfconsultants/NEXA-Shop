// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Minimal ERC-20 interface — only what we need. Matches Arc's native
/// USDC ERC-20 wrapper at 0x3600000000000000000000000000000000000000 (6 decimals).
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

/// @title PaymentReceiver
/// @notice Accepts USDC payments tagged with an off-chain order ID and records
///         an immutable on-chain receipt. Designed for Arc (Circle's stablecoin L1),
///         where USDC is both the native gas token (18 decimals) and available as
///         an ERC-20 (6 decimals). This contract intentionally only ever touches the
///         ERC-20 interface — never native value — per Arc's guidance to prefer the
///         ERC-20 interface for all application-level balances and transfers.
/// @dev Self-contained: implements its own Ownable / ReentrancyGuard / Pausable
///      so it has zero external imports and compiles with a bare `forge build`.
contract PaymentReceiver {
    // ---------------------------------------------------------------------
    // Ownable
    // ---------------------------------------------------------------------

    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "PaymentReceiver: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "PaymentReceiver: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ---------------------------------------------------------------------
    // ReentrancyGuard
    // ---------------------------------------------------------------------

    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private reentrancyStatus = NOT_ENTERED;

    modifier nonReentrant() {
        require(reentrancyStatus != ENTERED, "PaymentReceiver: reentrant call");
        reentrancyStatus = ENTERED;
        _;
        reentrancyStatus = NOT_ENTERED;
    }

    // ---------------------------------------------------------------------
    // Pausable
    // ---------------------------------------------------------------------

    bool public paused;

    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!paused, "PaymentReceiver: paused");
        _;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // ---------------------------------------------------------------------
    // Payment logic
    // ---------------------------------------------------------------------

    /// @notice The USDC ERC-20 token this contract accepts.
    IERC20 public immutable usdc;

    struct Payment {
        address buyer;
        uint256 amount;      // in USDC's native ERC-20 decimals (6 on Arc)
        uint64 timestamp;
        bool paid;
    }

    /// @dev orderId => Payment. orderId is expected to be produced off-chain
    ///      by the backend, e.g. keccak256(abi.encodePacked(internalOrderId)).
    mapping(bytes32 => Payment) public payments;

    /// @notice Running balance of funds held by this contract, available to withdraw.
    uint256 public collectedBalance;

    event PaymentReceived(
        bytes32 indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    event Withdrawn(address indexed to, uint256 amount);

    error OrderAlreadyPaid(bytes32 orderId);
    error ZeroAmount();
    error ZeroOrderId();
    error TransferFailed();
    error InsufficientContractBalance(uint256 requested, uint256 available);

    constructor(address usdcAddress, address initialOwner) {
        require(usdcAddress != address(0), "PaymentReceiver: usdc is the zero address");
        require(initialOwner != address(0), "PaymentReceiver: owner is the zero address");
        usdc = IERC20(usdcAddress);
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    /// @notice Pay for an order. Caller must have approved this contract for at
    ///         least `amount` USDC beforehand (usdc.approve(address(this), amount)).
    /// @dev Funds are pulled into this contract and held; the owner withdraws them
    ///      via `withdraw`. This keeps custody separate from the "is this order paid"
    ///      bookkeeping, so a store-address change never breaks past receipts.
    /// @param orderId  Backend-generated, unique identifier for the order.
    /// @param amount   Exact USDC amount (6 decimals) expected for this order.
    function pay(bytes32 orderId, uint256 amount) external nonReentrant whenNotPaused {
        if (orderId == bytes32(0)) revert ZeroOrderId();
        if (amount == 0) revert ZeroAmount();
        if (payments[orderId].paid) revert OrderAlreadyPaid(orderId);

        // Effects before the external call.
        payments[orderId] = Payment({
            buyer: msg.sender,
            amount: amount,
            timestamp: uint64(block.timestamp),
            paid: true
        });
        collectedBalance += amount;

        emit PaymentReceived(orderId, msg.sender, amount, block.timestamp);

        // Interaction last.
        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();
    }

    /// @notice Read a payment receipt for an order.
    function getPayment(bytes32 orderId) external view returns (Payment memory) {
        return payments[orderId];
    }

    /// @notice Convenience check used by the backend/indexer to confirm fulfillment
    ///         conditions before shipping/unlocking a digital good.
    function isPaidWithAtLeast(bytes32 orderId, uint256 minAmount) external view returns (bool) {
        Payment memory p = payments[orderId];
        return p.paid && p.amount >= minAmount;
    }

    /// @notice Owner withdraws collected USDC to an arbitrary address (e.g. treasury).
    ///         Kept separate from `pay` so a compromised/rotated treasury address
    ///         never blocks incoming payments.
    function withdraw(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "PaymentReceiver: withdraw to the zero address");
        if (amount > collectedBalance) {
            revert InsufficientContractBalance(amount, collectedBalance);
        }
        collectedBalance -= amount;
        emit Withdrawn(to, amount);
        bool ok = usdc.transfer(to, amount);
        if (!ok) revert TransferFailed();
    }

    /// @notice Sweeps the contract's full USDC balance to the owner. Useful as an
    ///         escape hatch if `collectedBalance` bookkeeping ever drifts from the
    ///         real token balance (e.g. someone sends USDC directly, bypassing `pay`).
    function sweep(address to) external onlyOwner nonReentrant {
        require(to != address(0), "PaymentReceiver: sweep to the zero address");
        uint256 bal = usdc.balanceOf(address(this));
        collectedBalance = 0;
        emit Withdrawn(to, bal);
        bool ok = usdc.transfer(to, bal);
        if (!ok) revert TransferFailed();
    }
}
