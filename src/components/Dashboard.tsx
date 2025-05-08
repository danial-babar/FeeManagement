'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  HStack,
  Select,
  Icon,
} from '@chakra-ui/react';
import { FaChartLine, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import mockApi from '@/services/mockApi';
import DashboardStats from './DashboardStats';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  revenueByMonth: {
    month: string;
    amount: number;
  }[];
  paymentsByMethod: {
    method: string;
    count: number;
  }[];
  defaultersByClass: {
    class: string;
    count: number;
  }[];
  upcomingPayments: {
    _id: string;
    studentName: string;
    dueDate: string;
    amount: number;
    installmentLabel: string;
  }[];
}

// Using mock API service instead of real API

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('year');
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication error. Please login again.');
          return;
        }

        const response = await mockApi.get('/api/dashboard/data', {
          params: { timeframe },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setDashboardData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchDashboardData();
    }
  }, [timeframe, isMounted]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Revenue chart data
  const revenueChartData = {
    labels: dashboardData?.revenueByMonth.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData?.revenueByMonth.map(item => item.amount) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Payment methods chart data
  const paymentMethodsChartData = {
    labels: dashboardData?.paymentsByMethod.map(item => item.method) || [],
    datasets: [
      {
        label: 'Payment Methods',
        data: dashboardData?.paymentsByMethod.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Defaulters by class chart data
  const defaultersChartData = {
    labels: dashboardData?.defaultersByClass.map(item => `Class ${item.class}`) || [],
    datasets: [
      {
        label: 'Defaulters by Class',
        data: dashboardData?.defaultersByClass.map(item => item.count) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Don't render anything during SSR to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Flex direction="column" align="center" justify="center" h="200px">
          <Icon as={FaExclamationTriangle} color="red.500" boxSize={10} mb={4} />
          <Heading size="md" textAlign="center" mb={2}>
            Error Loading Dashboard
          </Heading>
          <Text textAlign="center">{error}</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color={textColor}>
          Dashboard
        </Heading>
        <HStack>
          <Text>Timeframe:</Text>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            w="150px"
            size="sm"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </Select>
        </HStack>
      </Flex>

      <DashboardStats />

      <Box mt={8}>
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>
              <Icon as={FaChartLine} mr={2} />
              Revenue Analytics
            </Tab>
            <Tab>
              <Icon as={FaCalendarAlt} mr={2} />
              Upcoming Payments
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Box
                  p={6}
                  bg={bgColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="300px"
                >
                  <Heading size="sm" mb={4}>
                    Revenue Trend
                  </Heading>
                  <Line
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>

                <Box
                  p={6}
                  bg={bgColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="300px"
                >
                  <Heading size="sm" mb={4}>
                    Payment Methods
                  </Heading>
                  <Doughnut
                    data={paymentMethodsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </Box>

                <Box
                  p={6}
                  bg={bgColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="300px"
                >
                  <Heading size="sm" mb={4}>
                    Defaulters by Class
                  </Heading>
                  <Bar
                    data={defaultersChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>
              </SimpleGrid>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <Box
                p={6}
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="sm" mb={4}>
                  Upcoming Due Payments
                </Heading>
                {dashboardData?.upcomingPayments && dashboardData.upcomingPayments.length > 0 ? (
                  <Box>
                    {dashboardData.upcomingPayments.map((payment) => (
                      <Box
                        key={payment._id}
                        p={4}
                        mb={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      >
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="bold">{payment.studentName}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {payment.installmentLabel} - Due: {formatDate(payment.dueDate)}
                            </Text>
                          </Box>
                          <HStack>
                            <Text fontWeight="bold" color="blue.500">
                              {formatCurrency(payment.amount)}
                            </Text>
                            <Button size="sm" colorScheme="blue">
                              Collect
                            </Button>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text>No upcoming payments found.</Text>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
