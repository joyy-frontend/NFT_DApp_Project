// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MintAnimalToken is ERC721Enumerable {
    constructor() ERC721("h662Animals", "HAS") {

    
    }

    function mintAnimalToken() public {
        uint256 animalTokenId = totalSupply() + 1;  // totalSupply() : 지금까지 발행된(민팅된) NFT양을 나타냄, 이값이 유일해야 nft라고 할 수 있음. (ERC721Enumerable에서 제공해주는것.)
        _mint(msg.sender, animalTokenId);

    }
}
