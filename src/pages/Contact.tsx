import React from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  VStack,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ContactInfo = ({ icon, title, content }: {
  icon: React.ReactElement;
  title: string;
  content: string;
}) => (
  <VStack
    align="center"
    spacing={4}
    p={6}
    bg={useColorModeValue('white', 'gray.800')}
    borderRadius="lg"
    boxShadow="lg"
  >
    <Icon as={() => icon} boxSize={6} color="brand.500" />
    <Text fontWeight="bold">{title}</Text>
    <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
      {content}
    </Text>
  </VStack>
);

const Contact = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="calc(100vh - 64px)" bg={bg} pt={20} pb={16}>
      <Container maxW="container.xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">Contact Us</Heading>
              <Text
                fontSize="xl"
                color={useColorModeValue('gray.600', 'gray.400')}
                maxW="2xl"
              >
                Have questions? We're here to help. Send us a message and we'll
                respond as soon as possible.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <ContactInfo
                icon={<Mail size={24} />}
                title="Email"
                content="support@fitall.com"
              />
              <ContactInfo
                icon={<Phone size={24} />}
                title="Phone"
                content="+1 (555) 123-4567"
              />
              <ContactInfo
                icon={<MapPin size={24} />}
                title="Location"
                content="123 Fitness Street, Health City, FC 12345"
              />
            </SimpleGrid>

            <Box
              w="full"
              maxW="2xl"
              mx="auto"
              bg={cardBg}
              borderRadius="lg"
              p={8}
              boxShadow="xl"
            >
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="John"
                      focusBorderColor="brand.500"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Doe"
                      focusBorderColor="brand.500"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    type="text"
                    placeholder="How can we help?"
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    placeholder="Your message..."
                    rows={6}
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <Button
                  colorScheme="brand"
                  size="lg"
                  _hover={{ transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Send Message
                </Button>
              </Stack>
            </Box>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Contact;