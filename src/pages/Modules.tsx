import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Icon,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Droplets,
  Calculator,
  Activity,
  Footprints,
  Scale,
} from 'lucide-react';

const MotionBox = motion(Box);

const ModuleCard = ({ title, description, icon }: {
  title: string;
  description: string;
  icon: React.ElementType;
}) => {
  const { colorMode } = useColorMode();

  return (
    <MotionBox
      p={6}
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      borderRadius="lg"
      boxShadow="sm"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
      transition="all 0.2s"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Icon as={icon} w={10} h={10} color="brand.500" mb={4} />
      <Heading size="md" mb={2}>{title}</Heading>
      <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
        {description}
      </Text>
    </MotionBox>
  );
};

const Modules = () => {
  return (
    <Container maxW="container.xl">
      <VStack spacing={12} align="stretch">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading
            as="h1"
            size="2xl"
            mb={4}
            bgGradient="linear(to-r, brand.500, brand.600)"
            bgClip="text"
          >
            Fitness Modules
          </Heading>
          <Text fontSize="xl" color="gray.500">
            Everything you need to track and improve your fitness journey
          </Text>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          <ModuleCard
            title="Workout Tracking"
            description="Log and track your workouts, sets, reps, and weights with detailed progress charts."
            icon={Dumbbell}
          />
          <ModuleCard
            title="Hydration Monitor"
            description="Track your daily water intake and get reminders to stay hydrated throughout the day."
            icon={Droplets}
          />
          <ModuleCard
            title="Calorie Counter"
            description="Monitor your caloric intake and macronutrients with our comprehensive database."
            icon={Calculator}
          />
          <ModuleCard
            title="Activity Tracker"
            description="Track your daily activities, steps, and active minutes to meet your fitness goals."
            icon={Activity}
          />
          <ModuleCard
            title="Step Counter"
            description="Keep track of your daily steps and distance covered with detailed statistics."
            icon={Footprints}
          />
          <ModuleCard
            title="Body Metrics"
            description="Monitor your weight, BMI, and other important body measurements over time."
            icon={Scale}
          />
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Modules;