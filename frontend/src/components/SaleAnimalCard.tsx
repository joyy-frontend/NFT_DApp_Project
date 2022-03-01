import { Box, Button, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import { web3 } from '../contracts';
import AnimalCard from './AnimalCard';

interface SaleAnimalCardProps {
    animalType: string;
    animalPrice: string;
}

const SaleAnimalCard: FC<SaleAnimalCardProps> = ({ animalType, animalPrice }) => {
    return (
        <Box textAlign="center" w={150}>
            <AnimalCard animalType={ animalType } />
            <Box>
                <Text d="inline-block">
                    { web3.utils.fromWei(animalPrice) } Matic
                </Text>
                <Button size="sm" colorScheme="green" m={2}>Buy</Button>
            </Box>
        </Box>
    );
};

export default SaleAnimalCard;