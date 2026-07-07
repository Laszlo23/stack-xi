// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title STACK XI Culture Raffle — quest-gated tickets + transparent commit-reveal draw
contract CultureRaffle is ERC721, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;

    uint256 public totalMinted;
    uint256 public closeBlock;
    bytes32 public drawCommit;
    bytes32 public revealedSecret;
    uint256 public winnerTokenId;
    address public winner;
    bool public entriesClosed;
    bool public drawComplete;
    bool public prizeClaimed;

    mapping(address => bool) public allowed;
    mapping(address => bool) public hasMinted;

    event TicketMinted(address indexed holder, uint256 indexed tokenId);
    event AllowedSet(address indexed user, bool value);
    event PrizeFunded(address indexed from, uint256 amount);
    event DrawCommitted(bytes32 commitHash);
    event EntriesClosed(uint256 closeBlock);
    event DrawRevealed(bytes32 secret, uint256 winnerTokenId, address winner);
    event PrizeClaimed(address indexed winner, uint256 amount);

    error NotAllowed();
    error AlreadyMinted();
    error EntriesNotOpen();
    error EntriesStillOpen();
    error InvalidCommit();
    error DrawNotReady();
    error NotWinner();
    error PrizeAlreadyClaimed();
    error NoTickets();

    constructor(address bccAddress) ERC721("STACK XI Raffle Ticket", "SXRT") Ownable(msg.sender) {
        bcc = IERC20(bccAddress);
    }

    function setAllowed(address user, bool value) external onlyOwner {
        allowed[user] = value;
        emit AllowedSet(user, value);
    }

    function fundPrize(uint256 amount) external {
        bcc.safeTransferFrom(msg.sender, address(this), amount);
        emit PrizeFunded(msg.sender, amount);
    }

    function mint() external {
        if (!allowed[msg.sender]) revert NotAllowed();
        if (hasMinted[msg.sender]) revert AlreadyMinted();
        if (entriesClosed) revert EntriesNotOpen();

        hasMinted[msg.sender] = true;
        totalMinted++;
        _safeMint(msg.sender, totalMinted);
        emit TicketMinted(msg.sender, totalMinted);
    }

    function commitDraw(bytes32 commitHash) external onlyOwner {
        drawCommit = commitHash;
        emit DrawCommitted(commitHash);
    }

    function closeEntries() external onlyOwner {
        if (entriesClosed) revert EntriesStillOpen();
        entriesClosed = true;
        closeBlock = block.number;
        emit EntriesClosed(closeBlock);
    }

    function revealAndDraw(bytes32 secret) external onlyOwner {
        if (!entriesClosed) revert EntriesNotOpen();
        if (drawComplete) revert DrawNotReady();
        if (drawCommit != bytes32(0) && keccak256(abi.encodePacked(secret)) != drawCommit) {
            revert InvalidCommit();
        }
        if (totalMinted == 0) revert NoTickets();

        revealedSecret = secret;
        bytes32 entropy = keccak256(abi.encodePacked(secret, blockhash(closeBlock)));
        winnerTokenId = 1 + (uint256(entropy) % totalMinted);
        winner = ownerOf(winnerTokenId);
        drawComplete = true;
        emit DrawRevealed(secret, winnerTokenId, winner);
    }

    function claimPrize() external {
        if (!drawComplete) revert DrawNotReady();
        if (prizeClaimed) revert PrizeAlreadyClaimed();
        if (msg.sender != winner) revert NotWinner();

        prizeClaimed = true;
        uint256 amount = bcc.balanceOf(address(this));
        bcc.safeTransfer(winner, amount);
        emit PrizeClaimed(winner, amount);
    }

    function prizePoolBalance() external view returns (uint256) {
        return bcc.balanceOf(address(this));
    }
}
