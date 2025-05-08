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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import axios from 'axios';
import { format } from 'date-fns';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section?: string;
}

interface FeeStructure {
  _id: string;
  title: string;
  installments: {
    _id: string;
    label: string;
    amount: number;
    dueDate: Date;
    status: string;
  }[];
}

interface PaymentFormData {
  studentId: string;
  feeStructureId: string;
  installmentId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  transactionId?: string;
  notes?: string;
}

export default function Payments() {
  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    studentId: '',
    feeStructureId: '',
    installmentId: '',
    amount: 0,
    paymentMethod: 'cash',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students', {
          params: { status: 'active' },
        });
        setStudents(response.data.students);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchFeeStructures = async () => {
      if (!selectedStudent) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/fee-structures', {
          params: { class: selectedStudent.class },
        });
        setFeeStructures(response.data.feeStructures);
      } catch (error) {
        console.error('Error fetching fee structures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStructures();
  }, [selectedStudent]);

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s._id === studentId);
    setSelectedStudent(student || null);
    setPaymentData((prev) => ({
      ...prev,
      studentId,
      feeStructureId: '',
      installmentId: '',
      amount: 0,
    }));
  };

  const handleFeeStructureSelect = (feeStructureId: string) => {
    setPaymentData((prev) => ({
      ...prev,
      feeStructureId,
      installmentId: '',
      amount: 0,
    }));
  };

  const handleInstallmentSelect = (installmentId: string) => {
    const feeStructure = feeStructures.find(
      (fs) => fs._id === paymentData.feeStructureId
    );
    const installment = feeStructure?.installments.find(
      (i) => i._id === installmentId
    );

    setPaymentData((prev) => ({
      ...prev,
      installmentId,
      amount: installment?.amount || 0,
    }));
  };

  const handlePaymentSubmit = async () => {
    try {
      await axios.post('/api/payments/create', paymentData);
      onClose();
      // Refresh data or show success message
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Payments</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Process Payment
        </Button>
      </Flex>

      <Box
        p={6}
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner />
          </Flex>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Class</Th>
                <Th>Fee Structure</Th>
                <Th>Installment</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Due Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* Payment history will be displayed here */}
            </Tbody>
          </Table>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Process Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Student</FormLabel>
                <Select
                  placeholder="Select student"
                  value={paymentData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.rollNumber})
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedStudent && (
                <>
                  <FormControl>
                    <FormLabel>Fee Structure</FormLabel>
                    <Select
                      placeholder="Select fee structure"
                      value={paymentData.feeStructureId}
                      onChange={(e) => handleFeeStructureSelect(e.target.value)}
                    >
                      {feeStructures.map((structure) => (
                        <option key={structure._id} value={structure._id}>
                          {structure.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {paymentData.feeStructureId && (
                    <FormControl>
                      <FormLabel>Installment</FormLabel>
                      <Select
                        placeholder="Select installment"
                        value={paymentData.installmentId}
                        onChange={(e) => handleInstallmentSelect(e.target.value)}
                      >
                        {feeStructures
                          .find((fs) => fs._id === paymentData.feeStructureId)
                          ?.installments.map((installment) => (
                            <option key={installment._id} value={installment._id}>
                              {installment.label} - PKR{' '}
                              {installment.amount.toLocaleString()} (Due:{' '}
                              {format(new Date(installment.dueDate), 'MMM d, yyyy')}
                              )
                            </option>
                          ))}
                      </Select>
                    </FormControl>
                  )}

                  {paymentData.installmentId && (
                    <>
                      <FormControl>
                        <FormLabel>Amount</FormLabel>
                        <Input
                          type="number"
                          value={paymentData.amount}
                          isReadOnly
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          value={paymentData.paymentMethod}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              paymentMethod: e.target.value as PaymentFormData['paymentMethod'],
                            }))
                          }
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cheque">Cheque</option>
                          <option value="online">Online</option>
                        </Select>
                      </FormControl>

                      {paymentData.paymentMethod !== 'cash' && (
                        <FormControl>
                          <FormLabel>Transaction ID</FormLabel>
                          <Input
                            value={paymentData.transactionId}
                            onChange={(e) =>
                              setPaymentData((prev) => ({
                                ...prev,
                                transactionId: e.target.value,
                              }))
                            }
                          />
                        </FormControl>
                      )}

                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          value={paymentData.notes}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </FormControl>

                      <Button
                        colorScheme="blue"
                        onClick={handlePaymentSubmit}
                        isDisabled={!paymentData.installmentId}
                      >
                        Process Payment
                      </Button>
                    </>
                  )}
                </>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 