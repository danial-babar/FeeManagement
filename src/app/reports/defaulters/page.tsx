'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Text,
  Badge,
  useToast,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { format } from 'date-fns';

interface Defaulter {
  studentId: string;
  name: string;
  rollNumber: string;
  className: string;
  totalDue: number;
  overdueInstallments: {
    feeStructureId: string;
    installmentId: string;
    amount: number;
    dueDate: Date;
    daysOverdue: number;
  }[];
}

export default function DefaulterReports() {
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    daysOverdue: '30',
    class: '',
  });

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  useEffect(() => {
    const fetchDefaulters = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/reports/defaulters', {
          params: filters,
        });
        setDefaulters(response.data.defaulters);
      } catch (error) {
        console.error('Error fetching defaulters:', error);
        toast({
          title: 'Error fetching defaulters',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDefaulters();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/reports/defaulters/export', {
        params: filters,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `defaulters-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting defaulters:', error);
      toast({
        title: 'Error exporting defaulters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Defaulter Reports</Heading>
        <Button colorScheme="blue" onClick={handleExport}>
          Export to CSV
        </Button>
      </Flex>

      <Box
        p={6}
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        mb={6}
      >
        <Flex gap={4} mb={4}>
          <Select
            name="daysOverdue"
            value={filters.daysOverdue}
            onChange={handleFilterChange}
            width="200px"
          >
            <option value="30">30+ Days Overdue</option>
            <option value="60">60+ Days Overdue</option>
            <option value="90">90+ Days Overdue</option>
          </Select>

          <Select
            placeholder="Class"
            name="class"
            value={filters.class}
            onChange={handleFilterChange}
            width="200px"
          >
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
          </Select>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner />
          </Flex>
        ) : defaulters.length === 0 ? (
          <Text textAlign="center" py={4}>
            No defaulters found
          </Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Class</Th>
                <Th>Total Due</Th>
                <Th>Overdue Installments</Th>
                <Th>Days Overdue</Th>
              </Tr>
            </Thead>
            <Tbody>
              {defaulters.map((defaulter) => (
                <Tr key={defaulter.studentId}>
                  <Td>
                    <Text fontWeight="bold">{defaulter.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {defaulter.rollNumber}
                    </Text>
                  </Td>
                  <Td>{defaulter.className}</Td>
                  <Td>PKR {defaulter.totalDue.toLocaleString()}</Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {defaulter.overdueInstallments.map((installment, index) => (
                        <Text key={index} fontSize="sm">
                          {installment.amount.toLocaleString()} (Due:{' '}
                          {format(new Date(installment.dueDate), 'MMM d, yyyy')})
                        </Text>
                      ))}
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {defaulter.overdueInstallments.map((installment, index) => (
                        <Badge
                          key={index}
                          colorScheme={installment.daysOverdue > 90 ? 'red' : 'orange'}
                        >
                          {installment.daysOverdue} days
                        </Badge>
                      ))}
                    </VStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
} 