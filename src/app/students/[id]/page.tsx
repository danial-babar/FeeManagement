'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  Spinner, 
  Center, 
  useToast, 
  Flex, 
  Avatar, 
  Text, 
  Grid, 
  GridItem, 
  Divider, 
  Badge, 
  Button, 
  HStack,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaFileInvoice } from 'react-icons/fa';
import PageLayout from '@/app/PageLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  gender: string;
  dateOfBirth: string;
  admissionDate: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  profileImage?: string;
  feeStatus?: 'paid' | 'partial' | 'unpaid' | 'defaulter';
}

interface Payment {
  _id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast({
            title: 'Authentication error',
            description: 'Please login again',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          router.push('/login');
          return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Fetch student details
        const studentResponse = await axios.get(`${API_BASE_URL}/api/students/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStudent(studentResponse.data);
        
        // Fetch student payments
        const paymentsResponse = await axios.get(`${API_BASE_URL}/api/payments`, {
          params: { studentId: params.id },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setPayments(paymentsResponse.data.payments || []);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Failed to load student data');
        toast({
          title: 'Error',
          description: 'Failed to load student data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [params.id, router, toast]);

  const handleDeleteClick = async () => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication error',
          description: 'Please login again',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        router.push('/login');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_BASE_URL}/api/students/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'Success',
        description: 'Student deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/students');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getFeeStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'partial': return 'orange';
      case 'unpaid': return 'red';
      case 'defaulter': return 'red.600';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Center h="calc(100vh - 200px)">
          <Spinner size="xl" />
        </Center>
      </PageLayout>
    );
  }

  if (error || !student) {
    return (
      <PageLayout>
        <Container maxW="container.lg" py={8}>
          <Heading size="md" color="red.500">
            {error || 'Student not found'}
          </Heading>
        </Container>
      </PageLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={6}>
          <HStack spacing={4} mb={6}>
            <Button 
              variant="outline" 
              onClick={() => router.push('/students')}
            >
              Back to Students
            </Button>
            <Button
              as={NextLink}
              href={`/students/edit/${student._id}`}
              colorScheme="blue"
              leftIcon={<FaEdit />}
            >
              Edit
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FaTrash />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </HStack>
          
          <Box
            bg={bgColor}
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              p={6}
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              <Center mr={{ base: 0, md: 8 }} mb={{ base: 6, md: 0 }}>
                <Avatar 
                  size="2xl" 
                  name={student.name} 
                  src={student.profileImage} 
                  border="4px solid"
                  borderColor={borderColor}
                />
              </Center>
              
              <Box flex="1">
                <Flex 
                  justify="space-between" 
                  align={{ base: 'flex-start', sm: 'center' }}
                  direction={{ base: 'column', sm: 'row' }}
                  mb={4}
                >
                  <Heading size="lg">{student.name}</Heading>
                  <Badge 
                    colorScheme={getFeeStatusColor(student.feeStatus)} 
                    fontSize="md" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    mt={{ base: 2, sm: 0 }}
                  >
                    {student.feeStatus ? student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1) : 'Unknown'}
                  </Badge>
                </Flex>
                
                <Grid 
                  templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                  gap={4}
                >
                  <GridItem>
                    <Text fontWeight="bold" color="gray.500">Roll Number</Text>
                    <Text>{student.rollNumber}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold" color="gray.500">Class</Text>
                    <Text>Class {student.class}, Section {student.section}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold" color="gray.500">Gender</Text>
                    <Text>{student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold" color="gray.500">Date of Birth</Text>
                    <Text>{formatDate(student.dateOfBirth)}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold" color="gray.500">Admission Date</Text>
                    <Text>{formatDate(student.admissionDate)}</Text>
                  </GridItem>
                </Grid>
              </Box>
            </Flex>
            
            <Tabs isFitted variant="enclosed" p={6}>
              <TabList mb="1em">
                <Tab>Personal Info</Tab>
                <Tab>Contact Info</Tab>
                <Tab>Parent Info</Tab>
                <Tab>Payment History</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Grid 
                    templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
                    gap={6}
                  >
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Full Name</Text>
                      <Text fontSize="lg">{student.name}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Roll Number</Text>
                      <Text fontSize="lg">{student.rollNumber}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Class</Text>
                      <Text fontSize="lg">Class {student.class}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Section</Text>
                      <Text fontSize="lg">Section {student.section}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Gender</Text>
                      <Text fontSize="lg">{student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Date of Birth</Text>
                      <Text fontSize="lg">{formatDate(student.dateOfBirth)}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Admission Date</Text>
                      <Text fontSize="lg">{formatDate(student.admissionDate)}</Text>
                    </GridItem>
                  </Grid>
                </TabPanel>
                
                <TabPanel>
                  <Grid 
                    templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
                    gap={6}
                  >
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Email</Text>
                      <Text fontSize="lg">{student.email}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Phone</Text>
                      <Text fontSize="lg">+92 {student.phone}</Text>
                    </GridItem>
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <Text fontWeight="bold" color="gray.500">Address</Text>
                      <Text fontSize="lg">{student.address}</Text>
                    </GridItem>
                  </Grid>
                </TabPanel>
                
                <TabPanel>
                  <Grid 
                    templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
                    gap={6}
                  >
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Parent/Guardian Name</Text>
                      <Text fontSize="lg">{student.parentName}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Parent/Guardian Phone</Text>
                      <Text fontSize="lg">+92 {student.parentPhone}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color="gray.500">Parent/Guardian Email</Text>
                      <Text fontSize="lg">{student.parentEmail}</Text>
                    </GridItem>
                  </Grid>
                </TabPanel>
                
                <TabPanel>
                  {payments.length === 0 ? (
                    <Flex 
                      direction="column" 
                      align="center" 
                      justify="center" 
                      minH="200px"
                      p={8}
                      textAlign="center"
                    >
                      <Text fontSize="lg" mb={4}>No payment records found</Text>
                      <Button
                        as={NextLink}
                        href={`/payments/add?studentId=${student._id}`}
                        colorScheme="blue"
                        leftIcon={<FaFileInvoice />}
                      >
                        Record New Payment
                      </Button>
                    </Flex>
                  ) : (
                    <>
                      <Flex justify="flex-end" mb={4}>
                        <Button
                          as={NextLink}
                          href={`/payments/add?studentId=${student._id}`}
                          colorScheme="blue"
                          leftIcon={<FaFileInvoice />}
                          size="sm"
                        >
                          Record New Payment
                        </Button>
                      </Flex>
                      <Box overflowX="auto">
                        <Box as="table" width="100%" borderWidth="1px" borderRadius="lg">
                          <Box as="thead" bg="gray.50">
                            <Box as="tr">
                              <Box as="th" px={4} py={3} textAlign="left">Date</Box>
                              <Box as="th" px={4} py={3} textAlign="left">Receipt No.</Box>
                              <Box as="th" px={4} py={3} textAlign="left">Amount</Box>
                              <Box as="th" px={4} py={3} textAlign="left">Method</Box>
                              <Box as="th" px={4} py={3} textAlign="left">Status</Box>
                              <Box as="th" px={4} py={3} textAlign="left">Description</Box>
                            </Box>
                          </Box>
                          <Box as="tbody">
                            {payments.map((payment) => (
                              <Box as="tr" key={payment._id} _hover={{ bg: 'gray.50' }}>
                                <Box as="td" px={4} py={3}>{formatDate(payment.paymentDate)}</Box>
                                <Box as="td" px={4} py={3}>{payment.receiptNumber}</Box>
                                <Box as="td" px={4} py={3}>₹{payment.amount.toLocaleString()}</Box>
                                <Box as="td" px={4} py={3}>{payment.paymentMethod}</Box>
                                <Box as="td" px={4} py={3}>
                                  <Badge
                                    colorScheme={
                                      payment.status === 'completed' ? 'green' : 
                                      payment.status === 'pending' ? 'yellow' : 'red'
                                    }
                                  >
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </Badge>
                                </Box>
                                <Box as="td" px={4} py={3}>{payment.description}</Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Container>
    </PageLayout>
  );
}
