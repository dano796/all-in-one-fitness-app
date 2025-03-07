import React from 'react';
import { Box } from '@chakra-ui/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box as="main" flex="1" mt="72px" mb="auto">
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;