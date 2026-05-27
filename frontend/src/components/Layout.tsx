import React, { FC } from 'react';
import { Stack, Flex, Box, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

interface LayoutProps {
    account: string;
    accountLabel: string;
    chainName: string;
    connectAccount: () => void;
    switchAccount: () => void;
}

const Layout: FC<LayoutProps> = ({ children, account, accountLabel, chainName, connectAccount, switchAccount }) => {
    return (
        <Stack h="100vh">
            <Flex bg="purple.200" p={4} justifyContent="space-around" alignItems="center">
                <Box>
                    <Text fontWeight="bold">Joy-Animals</Text>
                </Box>
                <Link to="/">
                    <Button size="sm" colorScheme="blue">
                        Main
                    </Button>
                </Link>
                <Link to="my-animal">
                    <Button size="sm" colorScheme="red">
                        My Animal
                    </Button>
                </Link>
                <Link to="sale-animal">
                    <Button size="sm" colorScheme="green">
                        Sale Animal
                    </Button>
                </Link>
                <Box textAlign="right" minW={130}>
	                    {account ? (
	                        <>
	                            <Text fontSize="xs" color="gray.600">Wallet</Text>
	                            <Text fontSize="sm" fontWeight="bold">{accountLabel || `${account.slice(0, 6)}...${account.slice(-4)}`}</Text>
	                            <Text fontSize="xs" color="gray.600">{account.slice(0, 6)}...{account.slice(-4)}</Text>
	                            <Text fontSize="xs" color="gray.600">{chainName}</Text>
                            <Button mt={1} size="xs" colorScheme="purple" onClick={switchAccount}>
                                Switch Wallet
                            </Button>
                        </>
                    ) : (
                        <Button mt={1} size="xs" colorScheme="purple" onClick={switchAccount}>
                            Connect Wallet
                        </Button>
                    )}
                </Box>
            </Flex>
            <Flex direction="column" h="full" justifyContent="center" alignItems="center">
                {children}
            </Flex>
        </Stack>
    )
};

export default Layout;
