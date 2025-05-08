'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import mockApi from '@/services/mockApi';

interface DashboardStats {
  totalStudents: number;
  totalFeeStructures: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  defaulters: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    setIsMounted(true);
    
    const fetchStats = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Safely access localStorage only in browser environment
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token');
          if (!token) return;
        } else {
          return; // Don't proceed with API call during SSR
        }
        
        const response = await mockApi.get('/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Ensure we're setting the correct type
        setStats(response.data as DashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchStats();
    }
  }, [isMounted]);

  // Don't render anything during SSR to prevent hydration errors
  if (!isMounted) {
    return null;
  }
  
  if (loading) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Center>
          <Spinner size="lg" />
        </Center>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel>Total Students</StatLabel>
          <StatNumber>{stats?.totalStudents || 0}</StatNumber>
          <StatHelpText>Active students</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel>Fee Structures</StatLabel>
          <StatNumber>{stats?.totalFeeStructures || 0}</StatNumber>
          <StatHelpText>Active fee structures</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel>Total Payments</StatLabel>
          <StatNumber>{stats?.totalPayments || 0}</StatNumber>
          <StatHelpText>Processed payments</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel>Total Revenue</StatLabel>
          <StatNumber>PKR {stats?.totalRevenue?.toLocaleString() || 0}</StatNumber>
          <StatHelpText>Total collected amount</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel>Pending Payments</StatLabel>
          <StatNumber>{stats?.pendingPayments || 0}</StatNumber>
          <StatHelpText>Unpaid installments</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel>Defaulters</StatLabel>
          <StatNumber>{stats?.defaulters || 0}</StatNumber>
          <StatHelpText>Students with overdue payments</StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
} 