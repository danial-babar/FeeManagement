'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner, Center } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotificationSystem from '@/components/NotificationSystem';

interface PageLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function PageLayout({ 
  children, 
  requireAuth = false 
}: PageLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (requireAuth && !token) {
        // Redirect to login page if authentication is required but user is not logged in
        router.push('/login');
      } else {
        setIsAuthenticated(!!token);
        setIsLoading(false);
      }
    }
  }, [requireAuth, router]);

  // Prevent hydration errors by not rendering anything until client-side
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <Navbar />
        <Center flex="1">
          <Spinner size="xl" />
        </Center>
        <Footer />
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" py={8} px={{ base: 4, md: 8 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
