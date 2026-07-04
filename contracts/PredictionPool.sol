// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BCC prediction pool — records match picks on-chain
contract PredictionPool is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;
    address public sponsorGate;

    event Prediction(
        address indexed user,
        string matchId,
        bool pickHome,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address bccAddress) Ownable(msg.sender) {
        bcc = IERC20(bccAddress);
    }

    function setSponsorGate(address gate) external onlyOwner {
        sponsorGate = gate;
    }

    function predict(string calldata matchId, bool pickHome, uint256 amount) external {
        bcc.safeTransferFrom(msg.sender, address(this), amount);
        emit Prediction(msg.sender, matchId, pickHome, amount, block.timestamp);
    }

    /// @notice Sponsor contract pays stake on behalf of user
    function predictFor(address user, string calldata matchId, bool pickHome, uint256 amount) external {
        require(msg.sender == sponsorGate, "not sponsor");
        bcc.safeTransferFrom(msg.sender, address(this), amount);
        emit Prediction(user, matchId, pickHome, amount, block.timestamp);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        bcc.safeTransfer(to, amount);
    }
}
