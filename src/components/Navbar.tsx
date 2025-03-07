import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  useColorMode,
  useColorModeValue,
  Stack,
  Link,
  IconButton,
  useDisclosure,
  HStack,
  VStack,
  CloseButton,
} from '@chakra-ui/react';
import { Menu, Moon, Sun, X } from 'lucide-react';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
  ];

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      px={4}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <X /> : <Menu />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={onToggle}
        />
        
        <HStack spacing={8} alignItems="center">
          <Link as={RouterLink} to="/" fontSize="2xl" fontWeight="bold" color="brand.500">
            Fitness App
          </Link>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                as={RouterLink}
                to={item.path}
                px={2}
                py={1}
                rounded="md"
                _hover={{
                  textDecoration: 'none',
                  bg: useColorModeValue('gray.200', 'gray.700'),
                }}
              >
                {item.name}
              </Link>
            ))}
          </HStack>
        </HStack>

        <Flex alignItems="center">
          <Stack direction="row" spacing={7}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </Stack>
        </Flex>
      </Flex>

      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                as={RouterLink}
                to={item.path}
                px={2}
                py={1}
                rounded="md"
                _hover={{
                  textDecoration: 'none',
                  bg: useColorModeValue('gray.200', 'gray.700'),
                }}
              >
                {item.name}
              </Link>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;