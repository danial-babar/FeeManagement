'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Text,
  HStack,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import axios from 'axios';
import StudentCard from '@/components/StudentCard';
import PageLayout from '@/app/PageLayout';
import NextLink from 'next/link';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section?: string;
  email?: string;
  phone?: string;
  admissionDate: string;
  parentName?: string;
  profileImage?: string;
  feeStatus: 'paid' | 'partial' | 'unpaid' | 'defaulter';
}

export default function StudentsPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    feeStatus: '',
  });
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchStudents = async () => {
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
        const response = await axios.get(`${API_BASE_URL}/api/students`, {
          params: {
            page,
            limit,
            sort: sortField,
            order: sortOrder,
            ...filters,
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStudents(response.data.students);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to load students',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, limit, filters, sortField, sortOrder, router, toast]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

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
      await axios.delete(`${API_BASE_URL}/api/students/${studentToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStudents(students.filter(student => student._id !== studentToDelete));
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStudentToDelete(null);
      onClose();
    }
  };

  return (
    <PageLayout>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Students</Heading>
          <Button
            as={NextLink}
            href="/students/add"
            colorScheme="blue"
            leftIcon={<AddIcon />}
          >
            Add Student
          </Button>
        </Flex>

        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          boxShadow="md"
          mb={6}
        >
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            gap={4} 
            mb={6}
            wrap="wrap"
          >
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by name or roll number"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </InputGroup>
            
            <HStack spacing={2}>
              <Select
                placeholder="Class"
                name="class"
                value={filters.class}
                onChange={handleFilterChange}
                minW="120px"
              >
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
                <option value="4">Class 4</option>
                <option value="5">Class 5</option>
              </Select>
              
              <Select
                placeholder="Fee Status"
                name="feeStatus"
                value={filters.feeStatus}
                onChange={handleFilterChange}
                minW="150px"
              >
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
                <option value="defaulter">Defaulter</option>
              </Select>
              
              <IconButton
                aria-label="Sort"
                icon={sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                onClick={() => toggleSort('name')}
                variant="outline"
              />
            </HStack>
          </Flex>

          {loading ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" />
            </Flex>
          ) : students.length === 0 ? (
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              minH="400px"
              p={8}
              textAlign="center"
            >
              <Text fontSize="xl" mb={4}>No students found</Text>
              <Text color="gray.500" mb={6}>Try adjusting your search or filters</Text>
              <Button
                as={NextLink}
                href="/students/add"
                colorScheme="blue"
                leftIcon={<AddIcon />}
              >
                Add Your First Student
              </Button>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {students.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  onView={(id) => router.push(`/students/${id}`)}
                  onEdit={(id) => router.push(`/students/edit/${id}`)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </SimpleGrid>
          )}

          <Flex justify="space-between" align="center" mt={6}>
            <Text color="gray.600">
              Showing {students.length} of {total} students
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                isDisabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                isDisabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Student
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this student? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </PageLayout>
  );
}