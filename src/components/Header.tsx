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
  const bg = useColorModeValue('#FFFFFF', '#111827'); // Cambio de #1C1C1E a #111827
  const textColor = useColorModeValue('#1C1C1E', '#FFFFFF');

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
              <Dumbbell size={24} color="#FF9500" />
              <Box fontSize="xl" fontWeight="bold" color="#FF9500">
                All In One Fitness
              </Box>
            </Flex>
          </Link>
        </Flex>

        <Flex alignItems="center" gap={6}>
          <Link as={RouterLink} to="/about" fontWeight="medium" color="#FF9500">
            About
          </Link>
          <Link as={RouterLink} to="/contact" fontWeight="medium" color="#FF9500">
            Contact
          </Link>
          <Button as={RouterLink} to="/login" variant="ghost" color={textColor}>
            Login
          </Button>
          <Button as={RouterLink} to="/register" bg="#FFCC00" color="#1C1C1E" _hover={{ bg: "#FF9500" }}>
            Register
          </Button>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <Moon size={20} color="#FF9500" /> : <Sun size={20} color="#FFCC00" />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
