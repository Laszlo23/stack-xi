// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionPayout — v2 on-chain winner claims
 *
 * Migration path from treasury API (Phase 1):
 * 1. Deploy alongside existing PredictionPool (stakes stay in pool contract).
 * 2. Owner transfers pool BCC to this contract when opening claims for a match.
 * 3. Owner calls setMatchWinner(matchId, winnerSide) then openClaims(matchId).
 * 4. Winners call claim(matchId) — proportional share of allocated pool for that match.
 * 5. Deprecate POST /api/claims/request once claims are fully on-chain.
 *
 * Until v2 is live, treasury uses prediction-claims.json + admin mark-paid workflow.
 */
contract PredictionPayout is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;

    enum WinnerSide {
        None,
        Home,
        Away
    }

    struct MatchPayout {
        WinnerSide winner;
        uint256 poolAmount;
        uint256 totalWinningStake;
        bool claimsOpen;
        bool settled;
    }

    /// @dev matchId => user => staked amount on winning side (recorded off-chain or via oracle)
    mapping(string => mapping(address => uint256)) public winningStake;

    mapping(string => MatchPayout) public matches;
    mapping(string => mapping(address => bool)) public claimed;

    event MatchSettled(string indexed matchId, WinnerSide winner, uint256 poolAmount);
    event ClaimsOpened(string indexed matchId);
    event Claimed(string indexed matchId, address indexed user, uint256 amount);

    constructor(address bccAddress) Ownable(msg.sender) {
        bcc = IERC20(bccAddress);
    }

    /// @notice Fund payout pool for a match (transfer BCC to this contract first)
    function setMatchWinner(
        string calldata matchId,
        WinnerSide winner,
        uint256 poolAmount
    ) external onlyOwner {
        require(winner != WinnerSide.None, "winner required");
        matches[matchId] = MatchPayout({
            winner: winner,
            poolAmount: poolAmount,
            totalWinningStake: 0,
            claimsOpen: false,
            settled: true
        });
        emit MatchSettled(matchId, winner, poolAmount);
    }

    /// @notice Register a winner's stake weight (oracle / indexer until trustless)
    function recordWinningStake(
        string calldata matchId,
        address user,
        uint256 amount
    ) external onlyOwner {
        require(matches[matchId].settled, "not settled");
        if (claimed[matchId][user]) return;
        winningStake[matchId][user] = amount;
        matches[matchId].totalWinningStake += amount;
    }

    function openClaims(string calldata matchId) external onlyOwner {
        MatchPayout storage m = matches[matchId];
        require(m.settled, "not settled");
        require(!m.claimsOpen, "already open");
        m.claimsOpen = true;
        emit ClaimsOpened(matchId);
    }

    function claim(string calldata matchId) external {
        MatchPayout storage m = matches[matchId];
        require(m.claimsOpen, "claims closed");
        require(!claimed[matchId][msg.sender], "already claimed");

        uint256 stake = winningStake[matchId][msg.sender];
        require(stake > 0, "no winning stake");
        require(m.totalWinningStake > 0, "no pool");

        claimed[matchId][msg.sender] = true;
        uint256 payout = (m.poolAmount * stake) / m.totalWinningStake;
        bcc.safeTransfer(msg.sender, payout);
        emit Claimed(matchId, msg.sender, payout);
    }

    function withdrawUnclaimed(address to, uint256 amount) external onlyOwner {
        bcc.safeTransfer(to, amount);
    }
}
