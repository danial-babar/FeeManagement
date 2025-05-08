'use client';

import { useState, useEffect, useRef } from 'react';
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
import FeeStructureCard from '@/components/FeeStructureCard';
import PageLayout from '@/app/PageLayout';
import NextLink from 'next/link';

interface Installment {
  _id: string;
  label: string;
  amount: number;
  dueDate: string;
  isPaid?: boolean;
}

interface FeeStructure {
  _id: string;
  title: string;
  description?: string;
  totalAmount: number;
  academicYear: string;
  applicableClasses: string[];
  installments: Installment[];
  createdAt: string;
  updatedAt: string;
}

export default function FeeStructuresPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    academicYear: '',
    class: '',
  });
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [structureToDelete, setStructureToDelete] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchFeeStructures = async () => {
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
        const response = await axios.get(`${API_BASE_URL}/api/fee-structures`, {
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
        
        setFeeStructures(response.data.feeStructures);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching fee structures:', error);
        toast({
          title: 'Error',
          description: 'Failed to load fee structures',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStructures();
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
    setStructureToDelete(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!structureToDelete) return;

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
      await axios.delete(`${API_BASE_URL}/api/fee-structures/${structureToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFeeStructures(feeStructures.filter(structure => structure._id !== structureToDelete));
      toast({
        title: 'Success',
        description: 'Fee structure deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete fee structure',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStructureToDelete(null);
      onClose();
    }
  };

  // Calculate collection stats for each fee structure (mock data for now)
  const getCollectionStats = (structure: FeeStructure) => {
    // In a real app, this would come from the API
    const collected = Math.floor(Math.random() * structure.totalAmount);
    const pending = structure.totalAmount - collected;
    const percentageCollected = Math.floor((collected / structure.totalAmount) * 100);
    
    return {
      collected,
      pending,
      percentageCollected
    };
  };

  return (
    <PageLayout>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Fee Structures</Heading>
          <Button
            as={NextLink}
            href="/fee-structures/add"
            colorScheme="blue"
            leftIcon={<AddIcon />}
          >
            Add Fee Structure
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
                placeholder="Search by title"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </InputGroup>
            
            <HStack spacing={2}>
              <Input
                placeholder="Academic Year"
                name="academicYear"
                value={filters.academicYear}
                onChange={handleFilterChange}
                width="150px"
              />
              
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
              
              <IconButton
                aria-label="Sort"
                icon={sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                onClick={() => toggleSort('title')}
                variant="outline"
              />
            </HStack>
          </Flex>

          {loading ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" />
            </Flex>
          ) : feeStructures.length === 0 ? (
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              minH="400px"
              p={8}
              textAlign="center"
            >
              <Text fontSize="xl" mb={4}>No fee structures found</Text>
              <Text color="gray.500" mb={6}>Try adjusting your search or filters</Text>
              <Button
                as={NextLink}
                href="/fee-structures/add"
                colorScheme="blue"
                leftIcon={<AddIcon />}
              >
                Create Your First Fee Structure
              </Button>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {feeStructures.map((structure) => (
                <FeeStructureCard
                  key={structure._id}
                  feeStructure={structure}
                  onView={(id) => router.push(`/fee-structures/${id}`)}
                  onEdit={(id) => router.push(`/fee-structures/edit/${id}`)}
                  onDelete={handleDeleteClick}
                  showInstallments={true}
                  collectionStats={getCollectionStats(structure)}
                />
              ))}
            </SimpleGrid>
          )}

          <Flex justify="space-between" align="center" mt={6}>
            <Text color="gray.600">
              Showing {feeStructures.length} of {total} fee structures
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
                Delete Fee Structure
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this fee structure? This action cannot be undone.
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