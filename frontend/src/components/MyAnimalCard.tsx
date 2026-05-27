import { Box, Button, Input, InputGroup, InputRightAddon, Text, useToast } from '@chakra-ui/react';
import React, { ChangeEvent, FC, useState } from 'react';
import { mintAnimalTokenContract, saleAnimalTokenAddress, saleAnimalTokenContract, web3 } from '../contracts';
import AnimalCard from './AnimalCard';

export interface IMyAnimalCard {
    animalTokenId: string;
    animalType: string;
    animalPrice: string;
}

interface MyAnimalCardProps extends IMyAnimalCard {
    saleStatus: boolean;
    account: string;
}

const MyAnimalCard: FC<MyAnimalCardProps> = ({ 
    animalTokenId, 
    animalType, 
    animalPrice, 
    saleStatus, 
    account 
	}) => {
	    const [sellPrice, setSellPrice] = useState<string>("");
	    const [myAnimalPrice, setMyAnimalPrice] = useState<string>(animalPrice);
	    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	    const toast = useToast();
	    const sepoliaChainId = "0xaa36a7";

	    const onChangeSellPrice = (e: ChangeEvent<HTMLInputElement>) => {
	        setSellPrice(e.target.value);
	    };

	    const onClickSell = async () => {
	        try {
	            if(!account) {
	                toast({
	                    title: "Wallet is not connected.",
	                    description: "Connect MetaMask first.",
	                    status: "warning",
	                    duration: 4000,
	                    isClosable: true,
	                });
	                return;
	            }

	            const isApprovedForSale = await mintAnimalTokenContract.methods.isApprovedForAll(account, saleAnimalTokenAddress).call();

	            if(!saleStatus && !isApprovedForSale) {
	                toast({
	                    title: "Sale permission is not approved.",
	                    description: "Click Approve Sale before listing this animal.",
	                    status: "warning",
	                    duration: 5000,
	                    isClosable: true,
	                });
	                return;
	            }

	            if(!sellPrice || Number(sellPrice) <= 0) {
	                toast({
	                    title: "Enter a valid price.",
	                    description: "Use a small SepoliaETH amount like 0.001.",
	                    status: "warning",
	                    duration: 5000,
	                    isClosable: true,
	                });
	                return;
	            }

	            const chainId = await window.ethereum.request({ method: "eth_chainId" });

	            if(chainId !== sepoliaChainId) {
	                toast({
	                    title: "Wrong network.",
	                    description: "Switch MetaMask to Sepolia, then try again.",
	                    status: "warning",
	                    duration: 5000,
	                    isClosable: true,
	                });
	                return;
	            }

	            setIsSubmitting(true);
	            toast({
	                title: "Confirm in MetaMask.",
	                description: "Approve the sale listing transaction.",
	                status: "info",
	                duration: 5000,
	                isClosable: true,
	            });
	            
	            const response = await new Promise<any>((resolve, reject) => {
	                saleAnimalTokenContract.methods
	                    .setForSaleAnimalToken(animalTokenId, web3.utils.toWei(sellPrice, "ether"))
	                    .send({ from: account })
	                    .on("transactionHash", (transactionHash: string) => {
	                        toast({
	                            title: "Transaction sent.",
	                            description: transactionHash,
	                            status: "info",
	                            duration: 6000,
	                            isClosable: true,
	                        });
	                    })
	                    .on("receipt", resolve)
	                    .on("error", reject);
	            });

		            if(response.status) {
		                setMyAnimalPrice(web3.utils.toWei(sellPrice, "ether"));
		                setSellPrice("");
		                window.dispatchEvent(new Event("saleAnimalChanged"));
		                toast({
	                    title: "Listed for sale.",
	                    status: "success",
	                    duration: 3000,
	                    isClosable: true,
	                });
	            }
	            
	        } catch (error) {
	            console.error(error);
	            const message = error instanceof Error ? error.message : "Check MetaMask and the browser console for details.";

	            toast({
	                title: "Sale listing failed.",
	                description: message,
	                status: "error",
	                duration: 6000,
	                isClosable: true,
	            });
	        } finally {
	            setIsSubmitting(false);
	        }
	    }

	    const onClickUpdatePrice = async () => {
	        try {
	            if(!account || !sellPrice || Number(sellPrice) <= 0) return;

	            setIsSubmitting(true);

	            const response = await saleAnimalTokenContract.methods.updateAnimalTokenPrice(
	                animalTokenId,
	                web3.utils.toWei(sellPrice, "ether")
	            ).send({ from: account });

		            if(response.status) {
		                setMyAnimalPrice(web3.utils.toWei(sellPrice, "ether"));
		                setSellPrice("");
		                window.dispatchEvent(new Event("saleAnimalChanged"));
		                toast({
	                    title: "Price updated.",
	                    status: "success",
	                    duration: 3000,
	                    isClosable: true,
	                });
	            }
	        } catch (error) {
	            console.error(error);
	            const message = error instanceof Error ? error.message : "Check MetaMask and the browser console for details.";

	            toast({
	                title: "Price update failed.",
	                description: message,
	                status: "error",
	                duration: 6000,
	                isClosable: true,
	            });
	        } finally {
	            setIsSubmitting(false);
	        }
	    };

	    const onClickCancelSale = async () => {
	        try {
	            if(!account) return;

	            setIsSubmitting(true);

	            const response = await saleAnimalTokenContract.methods.cancelSaleAnimalToken(animalTokenId).send({ from: account });

		            if(response.status) {
		                setMyAnimalPrice("0");
		                setSellPrice("");
		                window.dispatchEvent(new Event("saleAnimalChanged"));
		                toast({
	                    title: "Sale canceled.",
	                    status: "success",
	                    duration: 3000,
	                    isClosable: true,
	                });
	            }
	        } catch (error) {
	            console.error(error);
	            const message = error instanceof Error ? error.message : "Check MetaMask and the browser console for details.";

	            toast({
	                title: "Sale cancel failed.",
	                description: message,
	                status: "error",
	                duration: 6000,
	                isClosable: true,
	            });
	        } finally {
	            setIsSubmitting(false);
	        }
	    };

    return (
	        <Box textAlign="center" w={190}>
            <AnimalCard animalType={animalType} />
            <Box mt={2}>
                { myAnimalPrice === "0" ? (
                <>
	                    <InputGroup size="sm">
	                        <Input 
	                            type="number" 
	                            min="0"
	                            step="0.001"
	                            placeholder="0.001"
	                            value={sellPrice} 
	                            onChange={onChangeSellPrice}
	                        />
	                        <InputRightAddon children="ETH" />
	                    </InputGroup>
	                    <Button size="sm" colorScheme="green" mt={2} onClick={onClickSell} isLoading={isSubmitting} >
	                        Sell
	                    </Button>
	                </>
	                ) : (
	                    <>
	                        <Text display="inline-block">
	                            Listed: { web3.utils.fromWei(myAnimalPrice)} SepoliaETH
	                        </Text>
		                        <InputGroup mt={2} size="sm">
		                            <Input 
		                                type="number" 
		                                min="0"
		                                step="0.001"
		                                placeholder="0.001"
		                                value={sellPrice} 
		                                onChange={onChangeSellPrice}
		                            />
		                            <InputRightAddon children="ETH" />
		                        </InputGroup>
	                        <Button size="sm" colorScheme="blue" mt={2} onClick={onClickUpdatePrice} isLoading={isSubmitting}>
	                            Update Price
	                        </Button>
	                        <Button size="sm" colorScheme="red" mt={2} onClick={onClickCancelSale} isLoading={isSubmitting}>
	                            Cancel Sale
	                        </Button>
	                    </>
	                    )}
            </Box>
        </Box>
    )
};

export default MyAnimalCard;
