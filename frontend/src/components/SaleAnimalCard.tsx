import { Box, Button, Text, useToast } from '@chakra-ui/react';
import React, { FC, useEffect, useState } from 'react';
import { mintAnimalTokenContract, saleAnimalTokenContract, web3 } from '../contracts';
import AnimalCard from './AnimalCard';

interface SaleAnimalCardProps {
    animalType: string;
    animalPrice: string;
    animalTokenId: string;
    account: string;
}

const SaleAnimalCard: FC<SaleAnimalCardProps> = ({ animalType, animalPrice, animalTokenId, account }) => {
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [isSold, setIsSold] = useState<boolean>(false);
    const toast = useToast();
    const sepoliaChainId = "0xaa36a7";

    const getAnimalTokenOwner = async () => {
        try {
            const response = await mintAnimalTokenContract.methods.ownerOf(animalTokenId).call();
            setIsOwner(!!account && response.toLowerCase() === account.toLowerCase());

        } catch (error) {
            console.error(error);
        }
    }

    const onClickBuy = async () => {
        try {
            if(!account) {
                toast({
                    title: "Wallet is not connected.",
                    description: "Connect MetaMask first, then try buying again.",
                    status: "warning",
                    duration: 4000,
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

            const balance = await web3.eth.getBalance(account);

            if(web3.utils.toBN(balance).lt(web3.utils.toBN(animalPrice))) {
                toast({
                    title: "Not enough SepoliaETH.",
                    description: `This animal costs ${web3.utils.fromWei(animalPrice)} SepoliaETH.`,
                    status: "warning",
                    duration: 6000,
                    isClosable: true,
                });
                return;
            }

            setIsBuying(true);
            toast({
                title: "Confirm in MetaMask.",
                description: "Approve the purchase transaction.",
                status: "info",
                duration: 5000,
                isClosable: true,
            });

            const response = await new Promise<any>((resolve, reject) => {
                saleAnimalTokenContract.methods
                    .purchaseAnimalToken(animalTokenId)
                    .send({ from: account, value: animalPrice })
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
                setIsSold(true);
                toast({
                    title: "Purchase complete.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Check MetaMask and the browser console for details.";

            toast({
                title: "Purchase failed.",
                description: message,
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setIsBuying(false);
        }
    };

    useEffect(() => {
        getAnimalTokenOwner();
    }, [account, animalTokenId]);

    if(isSold) return null;

    return (
        <Box textAlign="center" w={150}>
            <AnimalCard animalType={ animalType } />
            <Box>
                <Text d="inline-block">
                    { web3.utils.fromWei(animalPrice) } SepoliaETH
                </Text>
                <Button size="sm" colorScheme="green" m={2} isDisabled={!account || isOwner} isLoading={isBuying} onClick={onClickBuy}>
                    {isOwner ? "Your Listing" : "Buy"}
                </Button>
                {!account && <Text fontSize="xs" color="gray.500">Connect wallet to buy</Text>}
                {isOwner && <Text fontSize="xs" color="gray.500">Listed from this wallet</Text>}
            </Box>
        </Box>
    );
};

export default SaleAnimalCard;
