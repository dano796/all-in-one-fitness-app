import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, Image, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        className="relative min-h-[80vh] flex items-center"
        bg={colorMode => colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      >
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            <VStack align="start" spacing={6}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heading
                  as="h1"
                  size="2xl"
                  className="text-brand-500"
                  lineHeight="1.2"
                  mb={4}
                >
                  Transform Your Fitness Journey
                </Heading>
                <Text fontSize="xl" color="gray.500" mb={8}>
                  Track workouts, monitor nutrition, and achieve your fitness goals with our
                  comprehensive all-in-one fitness platform.
                </Text>
                <Button
                  size="lg"
                  colorScheme="brand"
                  onClick={() => navigate('/register')}
                  className="transform hover:scale-105 transition-transform"
                >
                  Start Your Journey
                </Button>
              </MotionBox>
            </VStack>

            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Fitness"
                className="rounded-lg shadow-2xl"
              />
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="7xl" py={20}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
          {[
            {
              title: 'Workout Tracking',
              description: 'Log and monitor your workouts with detailed analytics.',
              image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
            },
            {
              title: 'Nutrition Planning',
              description: 'Track calories and macros to optimize your diet.',
              image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
            },
            {
              title: 'Progress Tracking',
              description: 'Visualize your progress with detailed charts and metrics.',
              image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
            }
          ].map((feature, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <Image
                src={feature.image}
                alt={feature.title}
                className="w-full h-48 object-cover"
              />
              <Box p={6}>
                <Heading as="h3" size="md" mb={4}>
                  {feature.title}
                </Heading>
                <Text color="gray.500">
                  {feature.description}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;