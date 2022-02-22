// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "MintAnimalToken.sol";

contract SaleAnimalToken {
    MintAnimalToken public mintAnimalTokenAddress;

    constructor(address _mintAnimalTokenAddress) {
        mintAnimalTokenAddress = MintAnimalToken(_mintAnimalTokenAddress);
    }

    mapping(uint256 => uint256) public animalTokenPrices;
    uint256[] public onSaleAnimalTokenArray;    // 프론트엔드에서 이배열을 가지고 어떤게 판매중인 토큰인지 확인할수있다.

    function setForSaleAnimalToken(uint256 _animalTokenId, uint256 _price) public {
        address animalTokenOwner = mintAnimalTokenAddress.ownerOf(_animalTokenId);  // ownerOf() : 주인이 누군지 알려줌.

        require(animalTokenOwner == msg.sender, "Caller is not animal token owner.");
        require(_price > 0, "Price is zero or lower.");
        require(animalTokenPrices[_animalTokenId] == 0, "This animal token is already on sale.");
        require(mintAnimalTokenAddress.isApprovedForAll(animalTokenOwner, address(this)), "Animal token owenr did not approve token."); // animalTokenOwner 가 판매권한을 넘겼는지 체크, return true of false 

        animalTokenPrices[_animalTokenId] = _price;

        onSaleAnimalTokenArray.push(_animalTokenId);    // 판매중인 토큰은 푸시.
    } 
} 