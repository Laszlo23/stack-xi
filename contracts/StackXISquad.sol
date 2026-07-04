// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title STACK XI Founding Squad — bonding-curve mint paid in BCC culture token
contract StackXISquad is ERC721, Ownable {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    IERC20 public immutable BCC;
    uint256 public immutable BASE_PRICE;
    uint256 public immutable PRICE_INCREMENT;
    uint256 public earlyBelieverLimit;

    uint256 public mintCount;

    mapping(uint256 => bool) public minted;
    mapping(address => bool) public earlyBeliever;
    mapping(uint256 => address) public minterOf;
    mapping(uint256 => uint256) public mintOrderOf;
    mapping(uint256 => uint256) public mintedAtOf;

    string[12] private playerNames;

    event SquadMinted(
        address indexed minter,
        uint256 indexed playerId,
        uint256 mintOrder,
        uint256 pricePaid,
        uint256 nextPrice
    );

    error InvalidPlayer();
    error AlreadyMinted();

    constructor(
        address bccAddress,
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 initialEarlyBelieverLimit
    ) ERC721("STACK XI Founding Squad", "SXIS") Ownable(msg.sender) {
        BCC = IERC20(bccAddress);
        BASE_PRICE = basePrice;
        PRICE_INCREMENT = priceIncrement;
        earlyBelieverLimit = initialEarlyBelieverLimit;

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
        return BASE_PRICE + ((mintCount + 1) * PRICE_INCREMENT);
    }

    function remainingPlayers() public view returns (uint256) {
        return 11 - mintCount;
    }

    function mint(uint256 playerId) external {
        if (playerId < 1 || playerId > 11) revert InvalidPlayer();
        if (minted[playerId]) revert AlreadyMinted();

        uint256 price = currentMintPrice();
        BCC.safeTransferFrom(msg.sender, owner(), price);

        minted[playerId] = true;
        mintCount++;
        minterOf[playerId] = msg.sender;
        mintOrderOf[playerId] = mintCount;
        mintedAtOf[playerId] = block.timestamp;

        if (mintCount <= earlyBelieverLimit && !earlyBeliever[msg.sender]) {
            earlyBeliever[msg.sender] = true;
        }

        _safeMint(msg.sender, playerId);

        emit SquadMinted(msg.sender, playerId, mintCount, price, nextMintPrice());
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) internal view returns (string memory) {
        bool isEarly = earlyBeliever[minterOf[tokenId]];
        uint256 order = mintOrderOf[tokenId];

        string memory json = string.concat(
            '{"name":"STACK XI #',
            tokenId.toString(),
            " - ",
            playerNames[tokenId],
            '","description":"Founding squad player for STACK XI - Dallas WC matchdays on Base. Minters unlock personal video shout-outs, Farcaster tags, Decentraland lounge access, and finals whitelist perks.","image":"https://stackxi.xyz/squad/',
            tokenId.toString(),
            '.png","external_url":"https://stackxi.xyz/#squad","attributes":[',
            '{"trait_type":"Player","value":"',
            playerNames[tokenId],
            '"},{"trait_type":"Mint Order","value":',
            order.toString(),
            '},{"trait_type":"Early Believer","value":"',
            isEarly ? "Yes" : "No",
            '"},{"trait_type":"Video Shout-Out","value":"Queued"},{"trait_type":"Farcaster Tag","value":"Included"},{"trait_type":"Decentraland Lounge","value":"Priority"},{"trait_type":"Finals Whitelist","value":"',
            isEarly ? "Yes" : "Standard",
            '"},{"trait_type":"Director Cut Stories","value":"',
            isEarly ? "Unlocked" : "Locked",
            '"}]}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }
}
