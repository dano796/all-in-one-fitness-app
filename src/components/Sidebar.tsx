import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Activity,
  Dumbbell,
  Footprints,
  Droplets,
  Gauge,
  Scale,
} from 'lucide-react';

const SidebarIcon = ({ icon, label }: { icon: React.ReactElement; label: string }) => (
  <Tooltip label={label} placement="right" hasArrow>
    <Box
      p={3}
      cursor="pointer"
      borderRadius="lg"
      _hover={{
        bg: useColorModeValue('gray.100', 'gray.700'),
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s"
    >
      <Icon as={() => icon} boxSize={6} color="brand.500" />
    </Box>
  </Tooltip>
);

const Sidebar = () => {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      position="fixed"
      left={0}
      h="100vh"
      w="16"
      bg={bg}
      borderRight="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={8}
    >
      <VStack spacing={6}>
        <SidebarIcon icon={<Activity size={24} />} label="Calorie Tracking" />
        <SidebarIcon icon={<Dumbbell size={24} />} label="Workout Logging" />
        <SidebarIcon icon={<Footprints size={24} />} label="Step Monitoring" />
        <SidebarIcon icon={<Droplets size={24} />} label="Hydration Tracking" />
        <SidebarIcon icon={<Gauge size={24} />} label="1RM Calculator" />
        <SidebarIcon icon={<Scale size={24} />} label="Fitness Tools" />
      </VStack>
    </Box>
  );
};

export default Sidebar;