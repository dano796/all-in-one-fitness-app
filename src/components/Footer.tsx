import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';

const Footer = () => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="footer"
      mt="auto"
      py={8}
      borderTop="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify="space-between"
          align="center"
        >
          <Text>© 2024 FitAll. All rights reserved</Text>
          <Stack direction="row" spacing={6}>
            <Link as={RouterLink} to="/">
              Home
            </Link>
            <Link as={RouterLink} to="/about">
              About Us
            </Link>
            <Link as={RouterLink} to="/contact">
              Contact
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;