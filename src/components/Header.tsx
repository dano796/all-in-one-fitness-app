import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  useColorMode,
  useColorModeValue,
  Link,
  IconButton,
} from '@chakra-ui/react';
import { Dumbbell, Moon, Sun } from 'lucide-react';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.900');

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      width="100%"
      zIndex={10}
      bg={bg}
      boxShadow="sm"
    >
      <Flex
        px={8}
        h={16}
        alignItems="center"
        justifyContent="space-between"
        maxW="container.xl"
        mx="auto"
      >
        <Flex alignItems="center">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Flex alignItems="center" gap={2}>
              <Dumbbell size={24} className="text-brand-500" />
              <Box fontSize="xl" fontWeight="bold" color="brand.500">
                All In One Fitness
              </Box>
            </Flex>
          </Link>
        </Flex>

        <Flex alignItems="center" gap={6}>
          <Link as={RouterLink} to="/about" fontWeight="medium">
            About
          </Link>
          <Link as={RouterLink} to="/contact" fontWeight="medium">
            Contact
          </Link>
          <Button as={RouterLink} to="/login" variant="ghost">
            Login
          </Button>
          <Button as={RouterLink} to="/register" colorScheme="brand">
            Register
          </Button>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;