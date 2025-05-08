'use client';

import {
  Box,
  Flex,
  Text,
  Stack,
  Badge,
  useColorModeValue,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import NextLink from 'next/link';

interface PaymentCardProps {
  payment: {
    _id: string;
    studentId: string;
    studentName: string;
    paymentDate: string;
    amount: number;
    paymentMethod: string;
    status: 'success' | 'pending' | 'failed';
    receiptNumber: string;
    feeStructureId: string;
    feeStructureTitle?: string;
    installmentLabel?: string;
    transactionId?: string;
  };
  onViewReceipt?: (id: string) => void;
  onDownloadReceipt?: (id: string) => void;
  onRetryPayment?: (id: string) => void;
}

export default function PaymentCard({
  payment,
  onViewReceipt,
  onDownloadReceipt,
  onRetryPayment,
}: PaymentCardProps) {
  const statusColors = {
    success: 'green',
    pending: 'yellow',
    failed: 'red',
  };

  const statusLabels = {
    success: 'Successful',
    pending: 'Pending',
    failed: 'Failed',
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box
      w="full"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow={'md'}
      rounded={'lg'}
      p={5}
      position={'relative'}
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      borderLeft="4px solid"
      borderLeftColor={`${statusColors[payment.status]}.400`}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" fontSize="lg">
            Receipt #{payment.receiptNumber}
          </Text>
          <Text color="gray.500" fontSize="sm">
            {payment.studentName}
          </Text>
        </VStack>
        <Badge colorScheme={statusColors[payment.status]} px={2} py={1} borderRadius="md">
          {statusLabels[payment.status]}
        </Badge>
      </Flex>

      <Divider my={3} />

      <Stack spacing={3}>
        <HStack justifyContent="space-between">
          <Text color="gray.600">Amount:</Text>
          <Text fontWeight="bold">{formatCurrency(payment.amount)}</Text>
        </HStack>

        <HStack justifyContent="space-between">
          <Text color="gray.600">Payment Date:</Text>
          <Text>{formatDate(payment.paymentDate)}</Text>
        </HStack>

        <HStack justifyContent="space-between">
          <Text color="gray.600">Payment Method:</Text>
          <Text>{payment.paymentMethod}</Text>
        </HStack>

        {payment.installmentLabel && (
          <HStack justifyContent="space-between">
            <Text color="gray.600">Installment:</Text>
            <Text>{payment.installmentLabel}</Text>
          </HStack>
        )}

        {payment.transactionId && (
          <HStack justifyContent="space-between">
            <Text color="gray.600">Transaction ID:</Text>
            <Text fontSize="sm" fontFamily="mono">
              {payment.transactionId}
            </Text>
          </HStack>
        )}
      </Stack>

      <Divider my={3} />

      <Flex justifyContent="flex-end" mt={2}>
        {onViewReceipt && (
          <Tooltip label="View Receipt">
            <IconButton
              aria-label="View receipt"
              icon={<ViewIcon />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              mr={2}
              onClick={() => onViewReceipt(payment._id)}
              as={NextLink}
              href={`/payments/${payment._id}`}
            />
          </Tooltip>
        )}
        {onDownloadReceipt && payment.status === 'success' && (
          <Tooltip label="Download Receipt">
            <IconButton
              aria-label="Download receipt"
              icon={<DownloadIcon />}
              size="sm"
              colorScheme="green"
              variant="ghost"
              mr={2}
              onClick={() => onDownloadReceipt(payment._id)}
            />
          </Tooltip>
        )}
        {onRetryPayment && payment.status === 'failed' && (
          <Tooltip label="Retry Payment">
            <IconButton
              aria-label="Retry payment"
              icon={<RepeatIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onRetryPayment(payment._id)}
            />
          </Tooltip>
        )}
      </Flex>
    </Box>
  );
}
