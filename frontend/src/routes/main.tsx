import React, { FC, useState } from 'react';
import { Box, Text, Flex, Button, useToast } from '@chakra-ui/react';
import { mintAnimalTokenContract } from '../contracts';
import AnimalCard from '../components/AnimalCard';

interface MainProps {
    account: string;
    getAccount: () => Promise<string | undefined>;
}

const Main: FC<MainProps> = ({ account, getAccount }) => {
    const [newAnimalType, setNewAnimalType] = useState<string>();
    const [isMinting, setIsMinting] = useState<boolean>(false);
    const toast = useToast();
    const sepoliaChainId = "0xaa36a7";

    const onClickConnectWallet = async () => {
        try {
            await getAccount();
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Open MetaMask and try again.";

            toast({
                title: "Wallet connection failed.",
                description: message,
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        }
    };

    const onClickMint = async () => {
        try {
            let mintAccount = account;

            if(!mintAccount) {
                mintAccount = await getAccount() || "";
            }

            if(!mintAccount) {
                toast({
                    title: "Wallet is not connected.",
                    description: "Connect MetaMask first, then try minting again.",
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
                    description: "Switch MetaMask to Sepolia, then try minting again.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            setIsMinting(true);
            toast({
                title: "Confirm in MetaMask.",
                description: "Open MetaMask and approve the mint transaction.",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
            
            const response = await new Promise<any>((resolve, reject) => {
                mintAnimalTokenContract.methods
                    .mintAnimalToken()
                    .send({ from: mintAccount })
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
                const balanceLength = await mintAnimalTokenContract.methods.balanceOf(mintAccount).call();
                const animalTokenId = await mintAnimalTokenContract.methods.tokenOfOwnerByIndex(mintAccount, parseInt(balanceLength,10) - 1).call();
                const animalType = await mintAnimalTokenContract.methods.animalTypes(animalTokenId).call();

                setNewAnimalType(animalType);
                toast({
                    title: "Mint complete.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Check MetaMask and the browser console for details.";

            toast({
                title: "Mint failed.",
                description: message,
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setIsMinting(false);
        }
    };
    return (
    <Flex w="full" h="100vh" justifyContent="center" alignItems="center" direction="column">
        <Box>
            {newAnimalType ? (<AnimalCard animalType={newAnimalType}/>) : (<Text>Let's mint Animal Card!!!</Text>)}
        </Box>
        {!account ? (
            <Button mt={4} size="sm" colorScheme="purple" onClick={onClickConnectWallet}>Connect Wallet</Button>
        ) : (
            <Button mt={4} size="sm" colorScheme="blue" onClick={onClickMint} isLoading={isMinting}>Mint</Button>
        )}
    </Flex>
    )
};

export default Main;
