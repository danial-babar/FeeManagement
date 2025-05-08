'use client';

import { Suspense, useEffect, useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Spinner, Center, useColorModeValue } from '@chakra-ui/react';
import DashboardStats from '@/components/DashboardStats';
import Dashboard from '@/components/Dashboard';
import PageLayout from '@/app/PageLayout';

export default function DashboardPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <PageLayout>
      <Container maxW="container.xl">
        <Box bg={bgColor} p={6} borderRadius="lg">
          <Heading size="lg" mb={6}>Dashboard</Heading>
          
          {isMounted ? (
            <>
              <Box mb={8}>
                <DashboardStats />
              </Box>

              <Box mt={8}>
                <Dashboard />
              </Box>
            </>
          ) : (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
}