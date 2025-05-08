'use client';

import { ReactNode } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Flex
      direction="column"
      minHeight="100vh"
    >
      <Navbar />
      <Box flex="1" py={8} px={{ base: 4, md: 8 }}>
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
