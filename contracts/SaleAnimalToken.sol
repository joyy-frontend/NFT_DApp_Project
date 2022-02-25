// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "MintAnimalToken.sol";

contract SaleAnimalToken {
    MintAnimalToken public mintAnimalTokenAddress;  // MintAnimalToken을 deploy하면 배포한 주소값이 나오는데 그값을  MintAnimalToken 변수에 담는다. (아래 생성자를 통해서 담는다)

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

    function purchaseAnimalToken(uint256 _animalTokenId) public payable {
        uint256 price = animalTokenPrices[_animalTokenId];
        address animalTokenOwner = mintAnimalTokenAddress.ownerOf(_animalTokenId);

        require(price > 0, "Animal token not sale.");
        require(price <= msg.value, "Caller sent lower than price.");   // 함수실행할때 보내는 매틱의 양 (msg.value)
        require(animalTokenOwner != msg.sender, "Caller is animal token owner.");

        payable(animalTokenOwner).transfer(msg.value);  // owner에게 돈을 보내진다.

        // nft 카드는 돈을 지불한 사람에게 준다 (소유권 이전) *보내는사람, 받는사람, 뭘보내는지
        mintAnimalTokenAddress.safeTransferFrom(animalTokenOwner, msg.sender, _animalTokenId);
        
        // mapping에서 제거
        animalTokenPrices[_animalTokenId] = 0;  //가격을 0으로 셋팅

        // 판매중인 목록에서 제거
        for(uint256 i = 0; i < onSaleAnimalTokenArray.length; i++) {
            if(animalTokenPrices[onSaleAnimalTokenArray[i]] == 0) { // 가격이 0원인걸 찾아 제거
                onSaleAnimalTokenArray[i] = onSaleAnimalTokenArray[onSaleAnimalTokenArray.length -1];
                onSaleAnimalTokenArray.pop();
            }
        }
    }

    // 판매중인 토큰 배열의 길이
    function getOnSaleAnimalTokenArrayLength() view public returns (uint256) {
        return onSaleAnimalTokenArray.length;
    }
} 