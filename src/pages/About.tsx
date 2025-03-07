import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Heart, Trophy, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Feature = ({ icon, title, description }: {
  icon: React.ReactElement;
  title: string;
  description: string;
}) => (
  <VStack
    align="start"
    spacing={4}
    p={6}
    bg={useColorModeValue('white', 'gray.800')}
    borderRadius="lg"
    boxShadow="lg"
    _hover={{ transform: 'translateY(-4px)' }}
    transition="all 0.2s"
  >
    <Icon as={() => icon} color="brand.500" boxSize={6} />
    <Heading size="md">{title}</Heading>
    <Text color={useColorModeValue('gray.600', 'gray.400')}>{description}</Text>
  </VStack>
);

const About = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="calc(100vh - 64px)" bg={bg} pt={20} pb={16}>
      <Container maxW="container.xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={12} align="stretch">
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl">About FitAll</Heading>
              <Text
                fontSize="xl"
                color={useColorModeValue('gray.600', 'gray.400')}
                maxW="2xl"
                mx="auto"
              >
                We're on a mission to make fitness tracking simple, intuitive, and
                accessible to everyone. Our all-in-one platform helps you achieve
                your fitness goals with powerful tools and insights.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              <Feature
                icon={<Heart size={24} />}
                title="Health First"
                description="We prioritize your well-being with scientifically-backed approaches to fitness and nutrition tracking."
              />
              <Feature
                icon={<Trophy size={24} />}
                title="Goal Oriented"
                description="Set, track, and achieve your fitness goals with our comprehensive progress tracking system."
              />
              <Feature
                icon={<Users size={24} />}
                title="Community Driven"
                description="Join a community of like-minded individuals who support and motivate each other."
              />
              <Feature
                icon={<Target size={24} />}
                title="Personalized"
                description="Get customized recommendations based on your unique fitness journey and goals."
              />
            </SimpleGrid>

            <VStack spacing={8} align="stretch" pt={8}>
              <Heading size="xl" textAlign="center">Our Story</Heading>
              <Text
                fontSize="lg"
                color={useColorModeValue('gray.600', 'gray.400')}
                lineHeight="tall"
              >
                FitAll was born from a simple idea: fitness tracking shouldn't be
                complicated. We noticed that people were using multiple apps to track
                different aspects of their fitness journey - one for workouts,
                another for nutrition, and yet another for progress tracking. We
                knew there had to be a better way.
              </Text>
              <Text
                fontSize="lg"
                color={useColorModeValue('gray.600', 'gray.400')}
                lineHeight="tall"
              >
                Today, FitAll has grown into a comprehensive fitness platform that
                brings together all the tools you need in one place. Whether you're
                just starting your fitness journey or you're a seasoned athlete,
                FitAll is designed to help you reach your full potential.
              </Text>
            </VStack>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default About;