// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPredictionPool {
    function predict(string calldata matchId, bool pickHome, uint256 amount) external;
}

/// @title Treasury vault — sponsors 1,000 BCC predictions for the first 77 unique wallets
/// @dev Uses the existing PredictionPool.predict(); real user is recorded in SponsoredPredictionUsed
contract PredictionSponsor is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;
    IPredictionPool public immutable pool;

    uint256 public constant SPONSORED_STAKE = 1000 ether;
    uint256 public constant MAX_SPONSORED = 77;

    mapping(address => bool) public hasUsedSponsored;
    mapping(address => bool) public allowed;
    uint256 public sponsoredCount;

    event Funded(address indexed from, uint256 amount);
    event AllowedSet(address indexed user, bool allowed);
    event SponsoredPredictionUsed(
        address indexed user,
        string matchId,
        bool pickHome,
        uint256 amount
    );

    constructor(address bccAddress, address poolAddress) Ownable(msg.sender) {
        bcc = IERC20(bccAddress);
        pool = IPredictionPool(poolAddress);
    }

    /// @notice Treasury deposits BCC — fund with 77,000 BCC for full program
    function fund(uint256 amount) external {
        bcc.safeTransferFrom(msg.sender, address(this), amount);
        emit Funded(msg.sender, amount);
    }

    /// @notice Approve pool to pull sponsored stakes from this contract
    function setPoolAllowance() external onlyOwner {
        bcc.forceApprove(address(pool), type(uint256).max);
    }

    /// @notice Allow wallets that verified Farcaster FID or X via the app backend
    function setAllowed(address user, bool value) external onlyOwner {
        allowed[user] = value;
        emit AllowedSet(user, value);
    }

    function setAllowedBatch(address[] calldata users, bool value) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            allowed[users[i]] = value;
            emit AllowedSet(users[i], value);
        }
    }

    function sponsoredPredict(string calldata matchId, bool pickHome) external {
        require(allowed[msg.sender], "not verified");
        require(!hasUsedSponsored[msg.sender], "already used");
        require(sponsoredCount < MAX_SPONSORED, "no slots");
        require(bcc.balanceOf(address(this)) >= SPONSORED_STAKE, "insufficient fund");

        hasUsedSponsored[msg.sender] = true;
        sponsoredCount++;

        bcc.forceApprove(address(pool), SPONSORED_STAKE);
        pool.predict(matchId, pickHome, SPONSORED_STAKE);
        emit SponsoredPredictionUsed(msg.sender, matchId, pickHome, SPONSORED_STAKE);
    }

    function remainingSlots() external view returns (uint256) {
        if (sponsoredCount >= MAX_SPONSORED) return 0;
        return MAX_SPONSORED - sponsoredCount;
    }

    function isEligible(address user) external view returns (bool) {
        return
            allowed[user] &&
            !hasUsedSponsored[user] &&
            sponsoredCount < MAX_SPONSORED &&
            bcc.balanceOf(address(this)) >= SPONSORED_STAKE;
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        bcc.safeTransfer(to, amount);
    }
}
