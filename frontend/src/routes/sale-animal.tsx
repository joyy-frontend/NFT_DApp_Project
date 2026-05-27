import { Button, Flex, Grid, Text, useToast } from '@chakra-ui/react';
import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IMyAnimalCard } from '../components/MyAnimalCard';
import SaleAnimalCard from '../components/SaleAnimalCard';
import { mintAnimalTokenContract, saleAnimalTokenContract } from '../contracts';

interface SaleAnimalProps {
    account: string;
    getAccount: () => Promise<string | undefined>;
}

const SaleAnimal: FC<SaleAnimalProps> = ({ account, getAccount }) => {
    const [saleAnimalCardArray, setSaleAnimalCardArray] = useState<IMyAnimalCard[]>();
    const toast = useToast();
    const location = useLocation();

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
    const getOnSaleAnimalTokens = async () => {
        try {
            const onSaleAnimalTokenArrayLength = await saleAnimalTokenContract.methods.getOnSaleAnimalTokenArrayLength().call();
            const tempOnSaleArray: IMyAnimalCard[] = [];

            for(let i = 0; i < parseInt(onSaleAnimalTokenArrayLength, 10); i++) {
                const animalTokenId = await saleAnimalTokenContract.methods.onSaleAnimalTokenArray(i).call();
                const animalType = await mintAnimalTokenContract.methods.animalTypes(animalTokenId).call();
                const animalPrice = await saleAnimalTokenContract.methods.animalTokenPrices(animalTokenId).call();

                tempOnSaleArray.push({ animalTokenId, animalType, animalPrice });
            }

            setSaleAnimalCardArray(tempOnSaleArray);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getOnSaleAnimalTokens();
    }, [location.pathname, account]);

    useEffect(() => {
        window.addEventListener("saleAnimalChanged", getOnSaleAnimalTokens);

        return () => {
            window.removeEventListener("saleAnimalChanged", getOnSaleAnimalTokens);
        };
    }, []);

    return (
        <>
            {!account ? (
                <Flex direction="column" alignItems="center">
                    <Text>Connect your wallet to buy animals.</Text>
                    <Button mt={4} size="sm" colorScheme="purple" onClick={onClickConnectWallet}>Connect Wallet</Button>
                </Flex>
            ) : (
                <>
                    <Text fontSize="sm" color="gray.500">Connected: {account.slice(0, 6)}...{account.slice(-4)}</Text>
                    {saleAnimalCardArray && saleAnimalCardArray.length > 0 ? (
                        <Grid mt={4} templateColumns="repeat(4, 1fr)" gap={8}>
                            {saleAnimalCardArray.map((v, i) => {
                                return <SaleAnimalCard key={i} animalType={v.animalType} animalPrice={v.animalPrice} animalTokenId={v.animalTokenId} account={account}/>
                            })}
                        </Grid>
                    ) : (
                        <Text mt={4}>No animals are currently for sale.</Text>
                    )}
                </>
            )}
        </>
    )
}

export default SaleAnimal;
