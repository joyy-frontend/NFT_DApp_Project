import { Button, Flex, Grid, Text, useToast } from '@chakra-ui/react';
import React, { FC, useEffect, useState } from 'react';
import AnimalCard from '../components/AnimalCard';
import MyAnimalCard, { IMyAnimalCard } from '../components/MyAnimalCard';
import { mintAnimalTokenContract, saleAnimalTokenAddress } from '../contracts';

interface MyAnimalProps {
    account: string;
    getAccount: () => Promise<string | undefined>;
}

const MyAnimal: FC<MyAnimalProps> = ({ account, getAccount }) => {
    const [animalCardArray, setAnimalCardArray] = useState<IMyAnimalCard[]>();
    const [saleStatus, setSaleStatus] = useState<boolean>(false);
    const [isApproving, setIsApproving] = useState<boolean>(false);
    const toast = useToast();
    const sepoliaChainId = "0xaa36a7";

    const getAnimalTokens = async() => {
        try {
            const balanceLength = await mintAnimalTokenContract.methods.balanceOf(account).call();
            
            if (balanceLength === "0") return;
            const tempAnimalCardArray: IMyAnimalCard[] = [];

            const response = await mintAnimalTokenContract.methods
                .getAnimalTokens(account)
                .call();
            
            response.map((v: IMyAnimalCard) => {
                tempAnimalCardArray.push({ 
                    animalTokenId: v.animalTokenId, 
                    animalType: v.animalType, 
                    animalPrice: v.animalPrice 
                });
            });
            setAnimalCardArray(tempAnimalCardArray);
        } catch (error) {
            console.error(error);
        }
    };

    const getIsApprovedForAll = async() => {
        try {
            const response = await mintAnimalTokenContract.methods.isApprovedForAll(account, saleAnimalTokenAddress).call();
            setSaleStatus(response);
        } catch (error) {
            console.error(error);
        }
    }

    const onClickApproveToggle = async() => {
        try {
            if(!account) {
                toast({
                    title: "Wallet is not connected.",
                    description: "Connect MetaMask on the Main page first.",
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

            setIsApproving(true);
            toast({
                title: "Confirm in MetaMask.",
                description: `${saleStatus ? "Cancel" : "Approve"} the sale permission transaction.`,
                status: "info",
                duration: 5000,
                isClosable: true,
            });

            const response = await new Promise<any>((resolve, reject) => {
                mintAnimalTokenContract.methods
                    .setApprovalForAll(saleAnimalTokenAddress, !saleStatus)
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
                setSaleStatus(!saleStatus);
                toast({
                    title: saleStatus ? "Approval canceled." : "Approved for sale.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
            
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Check MetaMask and the browser console for details.";

            toast({
                title: "Approval failed.",
                description: message,
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setIsApproving(false);
        }
    }

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

    useEffect(() => {
        if(!account) return;
        
        getIsApprovedForAll();
        getAnimalTokens();    
    },[account]);

    useEffect(() => {
        console.log(animalCardArray);
    },[animalCardArray]);

    return (
        <>
            {!account ? (
                <Flex direction="column" alignItems="center">
                    <Text>Connect your wallet to view your animals.</Text>
                    <Button mt={4} size="sm" colorScheme="purple" onClick={onClickConnectWallet}>Connect Wallet</Button>
                </Flex>
            ) : (
                <>
                    <Flex alignItems="center">
                        <Text display="inline-block">Sale Permission : {saleStatus ? "Approved" : "Not Approved"} </Text>
                        <Button size="xs" ml={2} colorScheme={saleStatus ? "red" : "blue"} onClick={onClickApproveToggle} isLoading={isApproving}>{saleStatus ? "Revoke Approval" : "Approve Sale"}</Button>
                    </Flex>
                    {animalCardArray && animalCardArray.length > 0 ? (
                        <Grid templateColumns="repeat(4, 1fr)" gap={8} mt={4}>
                            {animalCardArray.map((v, i) => {
                                return <MyAnimalCard 
                                            key={i} 
                                            animalTokenId={v.animalTokenId} 
                                            animalType={v.animalType} 
                                            animalPrice={v.animalPrice} 
                                            saleStatus={saleStatus}
                                            account={account}
                                        />
                            })}
                        </Grid>
                    ) : (
                        <Text mt={4}>No animals yet. Mint one on the Main page.</Text>
                    )}
                </>
            )}
        </>
    )
}

export default MyAnimal;
