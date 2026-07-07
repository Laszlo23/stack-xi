// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title STACK XI Founding Squad V2 — blind-pack mint, 77 editions per player, global bonding curve
contract StackXISquadV2 is ERC721Enumerable, Ownable {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    uint256 public constant MAX_PLAYERS = 11;
    uint256 public constant MAX_PER_PLAYER = 77;
    uint256 public constant MAX_SUPPLY = 847;

    IERC20 public immutable BCC;
    uint256 public immutable BASE_PRICE;
    uint256 public immutable PRICE_INCREMENT;
    uint256 public immutable earlyBelieverLimit;

    uint256 public mintCount;
    uint256 private _nextTokenId;

    mapping(uint256 => uint256) public playerMintCount;
    mapping(address => bool) public earlyBeliever;
    mapping(address => uint256) public jokerBalance;

    mapping(uint256 => bool) public revealed;
    mapping(uint256 => uint256) public tokenPlayerId;
    mapping(uint256 => uint256) public editionOf;
    mapping(uint256 => uint256) public mintOrderOf;
    mapping(uint256 => address) public minterOf;
    mapping(uint256 => uint256) public mintedAtOf;

    string[12] private playerNames;

    event PackMinted(
        address indexed minter,
        uint256 indexed tokenId,
        uint256 mintOrder,
        uint256 pricePaid,
        uint256 nextPrice
    );

    event PackOpened(
        address indexed opener,
        uint256 indexed tokenId,
        uint256 playerId,
        uint256 edition,
        uint256 mintOrder,
        bool usedJoker
    );

    event JokerGranted(address indexed account, uint256 amount, uint256 newBalance);
    event JokerConsumed(address indexed account, uint256 remaining);

    error SoldOut();
    error InvalidPlayer();
    error PlayerSoldOut();
    error PackAlreadyRevealed();
    error PackNotRevealed();
    error NotPackOwner();
    error InsufficientJokers();

    constructor(
        address bccAddress,
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 initialEarlyBelieverLimit
    ) ERC721("STACK XI Squad Pack", "SXPK") Ownable(msg.sender) {
        BCC = IERC20(bccAddress);
        BASE_PRICE = basePrice;
        PRICE_INCREMENT = priceIncrement;
        earlyBelieverLimit = initialEarlyBelieverLimit;
        _nextTokenId = 1;

        playerNames[1] = "ZeroKeeper";
        playerNames[2] = "0xWall";
        playerNames[3] = "BlockChad";
        playerNames[4] = "RugPullr";
        playerNames[5] = "GasFee";
        playerNames[6] = "MidPepe";
        playerNames[7] = "SigMaestro";
        playerNames[8] = "DAOnte";
        playerNames[9] = "MoonStrike";
        playerNames[10] = "ApeShotz";
        playerNames[11] = "CAPTAIN VITALIK";
    }

    function currentMintPrice() public view returns (uint256) {
        return BASE_PRICE + (mintCount * PRICE_INCREMENT);
    }

    function nextMintPrice() public view returns (uint256) {
        if (mintCount >= MAX_SUPPLY) return 0;
        return BASE_PRICE + ((mintCount + 1) * PRICE_INCREMENT);
    }

    function remainingPacks() public view returns (uint256) {
        return MAX_SUPPLY - mintCount;
    }

    function playerRemaining(uint256 playerId) public view returns (uint256) {
        if (playerId < 1 || playerId > MAX_PLAYERS) return 0;
        return MAX_PER_PLAYER - playerMintCount[playerId];
    }

    function mintPack() external {
        if (mintCount >= MAX_SUPPLY) revert SoldOut();

        uint256 price = currentMintPrice();
        BCC.safeTransferFrom(msg.sender, owner(), price);

        mintCount++;
        uint256 tokenId = _nextTokenId++;
        uint256 order = mintCount;

        minterOf[tokenId] = msg.sender;
        mintOrderOf[tokenId] = order;
        mintedAtOf[tokenId] = block.timestamp;

        if (order <= earlyBelieverLimit && !earlyBeliever[msg.sender]) {
            earlyBeliever[msg.sender] = true;
            jokerBalance[msg.sender] += 1;
            emit JokerGranted(msg.sender, 1, jokerBalance[msg.sender]);
        }

        _safeMint(msg.sender, tokenId);

        emit PackMinted(msg.sender, tokenId, order, price, nextMintPrice());
    }

    function openPack(uint256 tokenId) external {
        _openPack(tokenId, 0, false);
    }

    function openPackWithJoker(uint256 tokenId, uint256 playerId) external {
        if (playerId < 1 || playerId > MAX_PLAYERS) revert InvalidPlayer();
        if (playerMintCount[playerId] >= MAX_PER_PLAYER) revert PlayerSoldOut();
        if (jokerBalance[msg.sender] == 0) revert InsufficientJokers();
        jokerBalance[msg.sender] -= 1;
        emit JokerConsumed(msg.sender, jokerBalance[msg.sender]);
        _openPack(tokenId, playerId, true);
    }

    function grantJoker(address account, uint256 amount) external onlyOwner {
        jokerBalance[account] += amount;
        emit JokerGranted(account, amount, jokerBalance[account]);
    }

    function _openPack(uint256 tokenId, uint256 chosenPlayerId, bool usedJoker) internal {
        if (ownerOf(tokenId) != msg.sender) revert NotPackOwner();
        if (revealed[tokenId]) revert PackAlreadyRevealed();

        uint256 playerId = chosenPlayerId;
        if (!usedJoker) {
            playerId = _rollRandomPlayer(tokenId);
        }

        playerMintCount[playerId]++;
        uint256 edition = playerMintCount[playerId];

        revealed[tokenId] = true;
        tokenPlayerId[tokenId] = playerId;
        editionOf[tokenId] = edition;

        emit PackOpened(msg.sender, tokenId, playerId, edition, mintOrderOf[tokenId], usedJoker);
    }

    function _rollRandomPlayer(uint256 tokenId) internal view returns (uint256) {
        uint256 availableCount;
        for (uint256 i = 1; i <= MAX_PLAYERS; i++) {
            if (playerMintCount[i] < MAX_PER_PLAYER) availableCount++;
        }
        if (availableCount == 0) revert SoldOut();

        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    tokenId,
                    mintCount,
                    block.timestamp,
                    msg.sender
                )
            )
        );
        uint256 pick = seed % availableCount;

        uint256 cursor;
        for (uint256 i = 1; i <= MAX_PLAYERS; i++) {
            if (playerMintCount[i] < MAX_PER_PLAYER) {
                if (cursor == pick) return i;
                cursor++;
            }
        }
        revert SoldOut();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) internal view returns (string memory) {
        uint256 order = mintOrderOf[tokenId];
        address minter = minterOf[tokenId];
        bool isEarly = earlyBeliever[minter];

        if (!revealed[tokenId]) {
            string memory json = string.concat(
                '{"name":"STACK XI Sealed Pack #',
                order.toString(),
                '","description":"Sealed squad pack - open to reveal your founding player. 77 editions per character on Base.","image":"https://nftpepesoccer.4everbucket.com/pack-sealed.jpg","external_url":"https://pepe.buildingcultureid.space/squad","attributes":[',
                '{"trait_type":"Status","value":"Sealed"},{"trait_type":"Global Mint Order","value":',
                order.toString(),
                '},{"trait_type":"Early Believer Slot","value":"',
                isEarly ? "Yes" : "Pending",
                '"}]}'
            );
            return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
        }

        uint256 playerId = tokenPlayerId[tokenId];
        uint256 edition = editionOf[tokenId];

        string memory json = string.concat(
            '{"name":"STACK XI #',
            playerId.toString(),
            " - ",
            playerNames[playerId],
            " Ed ",
            edition.toString(),
            "/77",
            '","description":"Founding squad player for STACK XI - blind pack reveal on Base. Holders unlock prediction boosts, merch codes, and culture rewards.","image":"https://nftpepesoccer.4everbucket.com/player-',
            playerId.toString(),
            '.jpg","external_url":"https://pepe.buildingcultureid.space/squad","attributes":[',
            '{"trait_type":"Player","value":"',
            playerNames[playerId],
            '"},{"trait_type":"Edition","value":"',
            edition.toString(),
            "/77",
            '"},{"trait_type":"Global Mint Order","value":',
            order.toString(),
            '},{"trait_type":"Early Believer","value":"',
            isEarly ? "Yes" : "No",
            '"},{"trait_type":"Prediction Boost","value":"Active"},{"trait_type":"Merch Perk","value":"Tiered"},{"trait_type":"Video Shout-Out","value":"Eligible"}]}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0) && !revealed[tokenId]) {
            revert PackNotRevealed();
        }
        return super._update(to, tokenId, auth);
    }
}
