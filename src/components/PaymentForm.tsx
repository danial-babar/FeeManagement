'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Select,
  FormErrorMessage,
  useToast,
  Heading,
  Text,
  Divider,
  RadioGroup,
  Radio,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
}

interface FeeStructure {
  _id: string;
  title: string;
  totalAmount: number;
  installments: {
    _id: string;
    label: string;
    amount: number;
    dueDate: string;
  }[];
}

interface PaymentFormProps {
  initialValues?: {
    _id?: string;
    studentId: string;
    feeStructureId: string;
    installmentId?: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    transactionId?: string;
    notes?: string;
  };
  isEdit?: boolean;
}

const validationSchema = Yup.object().shape({
  studentId: Yup.string().required('Student is required'),
  feeStructureId: Yup.string().required('Fee structure is required'),
  installmentId: Yup.string().when('feeStructureId', {
    is: (val: string) => !!val,
    then: (schema) => schema.required('Installment is required'),
    otherwise: (schema) => schema,
  }),
  amount: Yup.number()
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0'),
  paymentMethod: Yup.string().required('Payment method is required'),
  paymentDate: Yup.date().required('Payment date is required'),
  transactionId: Yup.string().when('paymentMethod', {
    is: (method: string) => method !== 'cash',
    then: (schema) => schema.required('Transaction ID is required'),
    otherwise: (schema) => schema,
  }),
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PaymentForm({ initialValues, isEdit = false }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication error. Please login again.');
          router.push('/login');
          return;
        }

        const [studentsResponse, feeStructuresResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/fee-structures`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudents(studentsResponse.data);
        setFeeStructures(feeStructuresResponse.data);

        // If editing, set the selected fee structure
        if (isEdit && initialValues?.feeStructureId) {
          const selected = feeStructuresResponse.data.find(
            (fs: FeeStructure) => fs._id === initialValues.feeStructureId
          );
          if (selected) {
            setSelectedFeeStructure(selected);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, isEdit, initialValues]);

  const formik = useFormik({
    initialValues: initialValues || {
      studentId: '',
      feeStructureId: '',
      installmentId: '',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
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

        const endpoint = isEdit 
          ? `${API_BASE_URL}/api/payments/${initialValues?._id}`
          : `${API_BASE_URL}/api/payments`;
        
        const method = isEdit ? 'put' : 'post';
        
        await axios({
          method,
          url: endpoint,
          data: values,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast({
          title: isEdit ? 'Payment updated' : 'Payment processed successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirect to payments list
        router.push('/payments');
      } catch (error) {
        console.error('Error submitting payment:', error);
        toast({
          title: isEdit ? 'Error updating payment' : 'Error processing payment',
          description: 'Please try again later',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFeeStructureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const feeStructureId = e.target.value;
    formik.setFieldValue('feeStructureId', feeStructureId);
    formik.setFieldValue('installmentId', '');
    formik.setFieldValue('amount', 0);

    if (feeStructureId) {
      const selected = feeStructures.find((fs) => fs._id === feeStructureId);
      if (selected) {
        setSelectedFeeStructure(selected);
      }
    } else {
      setSelectedFeeStructure(null);
    }
  };

  const handleInstallmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const installmentId = e.target.value;
    formik.setFieldValue('installmentId', installmentId);

    if (installmentId && selectedFeeStructure) {
      const installment = selectedFeeStructure.installments.find(
        (inst) => inst._id === installmentId
      );
      if (installment) {
        formik.setFieldValue('amount', installment.amount);
      }
    }
  };

  if (isLoading) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="md">
        <Text>Loading payment form...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={formik.handleSubmit}
      bg={bgColor}
      p={6}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading size="lg" mb={6}>
        {isEdit ? 'Edit Payment' : 'Process New Payment'}
      </Heading>

      <VStack spacing={6} align="stretch">
        <FormControl
          isInvalid={formik.touched.studentId && Boolean(formik.errors.studentId)}
        >
          <FormLabel>Student</FormLabel>
          <Select
            name="studentId"
            value={formik.values.studentId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Select student"
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} - Roll No: {student.rollNumber} (Class {student.class}-{student.section})
              </option>
            ))}
          </Select>
          <FormErrorMessage>{formik.errors.studentId}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={
            formik.touched.feeStructureId && Boolean(formik.errors.feeStructureId)
          }
        >
          <FormLabel>Fee Structure</FormLabel>
          <Select
            name="feeStructureId"
            value={formik.values.feeStructureId}
            onChange={handleFeeStructureChange}
            onBlur={formik.handleBlur}
            placeholder="Select fee structure"
          >
            {feeStructures.map((feeStructure) => (
              <option key={feeStructure._id} value={feeStructure._id}>
                {feeStructure.title} - Total: PKR {feeStructure.totalAmount}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{formik.errors.feeStructureId}</FormErrorMessage>
        </FormControl>

        {selectedFeeStructure && (
          <FormControl
            isInvalid={
              formik.touched.installmentId && Boolean(formik.errors.installmentId)
            }
          >
            <FormLabel>Installment</FormLabel>
            <Select
              name="installmentId"
              value={formik.values.installmentId}
              onChange={handleInstallmentChange}
              onBlur={formik.handleBlur}
              placeholder="Select installment"
            >
              {selectedFeeStructure.installments.map((installment) => (
                <option key={installment._id} value={installment._id}>
                  {installment.label} - PKR {installment.amount} (Due: {new Date(installment.dueDate).toLocaleDateString()})
                </option>
              ))}
            </Select>
            <FormErrorMessage>{formik.errors.installmentId}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl
          isInvalid={formik.touched.amount && Boolean(formik.errors.amount)}
        >
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            name="amount"
            value={formik.values.amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={
            formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)
          }
        >
          <FormLabel>Payment Method</FormLabel>
          <RadioGroup
            name="paymentMethod"
            value={formik.values.paymentMethod}
            onChange={(value) => formik.setFieldValue('paymentMethod', value)}
          >
            <Stack direction="row" spacing={5}>
              <Radio value="cash">Cash</Radio>
              <Radio value="bank_transfer">Bank Transfer</Radio>
              <Radio value="credit_card">Credit Card</Radio>
              <Radio value="debit_card">Debit Card</Radio>
              <Radio value="online">Online Payment</Radio>
            </Stack>
          </RadioGroup>
          <FormErrorMessage>{formik.errors.paymentMethod}</FormErrorMessage>
        </FormControl>

        {formik.values.paymentMethod !== 'cash' && (
          <FormControl
            isInvalid={
              formik.touched.transactionId && Boolean(formik.errors.transactionId)
            }
          >
            <FormLabel>Transaction ID</FormLabel>
            <Input
              name="transactionId"
              value={formik.values.transactionId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.transactionId}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl
          isInvalid={
            formik.touched.paymentDate && Boolean(formik.errors.paymentDate)
          }
        >
          <FormLabel>Payment Date</FormLabel>
          <Input
            type="date"
            name="paymentDate"
            value={formik.values.paymentDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormErrorMessage>{formik.errors.paymentDate}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Notes (Optional)</FormLabel>
          <Input
            name="notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
            placeholder="Additional notes about this payment"
          />
        </FormControl>

        <Divider my={2} />

        <HStack spacing={4} justify="flex-end">
          <Button
            variant="outline"
            onClick={() => router.push('/payments')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={!formik.isValid || isSubmitting}
          >
            {isEdit ? 'Update Payment' : 'Process Payment'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
