'use client';

import { useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
  useColorModeValue,
  Flex,
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { FaPrint, FaDownload, FaEnvelope } from 'react-icons/fa';

interface ReceiptGeneratorProps {
  receipt: {
    receiptNumber: string;
    paymentDate: string;
    studentName: string;
    rollNumber: string;
    class: string;
    section: string;
    feeStructureTitle: string;
    installmentLabel: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    paidBy?: string;
    notes?: string;
  };
  schoolInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  onPrint?: () => void;
  onDownload?: () => void;
  onSendEmail?: () => void;
}

export default function ReceiptGenerator({
  receipt,
  schoolInfo,
  onPrint,
  onDownload,
  onSendEmail,
}: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBgColor = useColorModeValue('blue.50', 'blue.900');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print functionality
      const printContents = receiptRef.current?.innerHTML;
      const originalContents = document.body.innerHTML;

      if (printContents) {
        document.body.innerHTML = `
          <html>
            <head>
              <title>Fee Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .receipt-container { max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { display: flex; justify-content: space-between; align-items: center; }
                .logo { max-width: 100px; max-height: 100px; }
                .divider { border-top: 1px solid #ccc; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; }
                @media print {
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContents}
              </div>
            </body>
          </html>
        `;
        window.print();
        document.body.innerHTML = originalContents;
      }
    }
  };

  return (
    <Box>
      <HStack spacing={4} mb={4} justifyContent="flex-end">
        <Button leftIcon={<FaPrint />} colorScheme="blue" onClick={handlePrint}>
          Print
        </Button>
        {onDownload && (
          <Button leftIcon={<FaDownload />} colorScheme="green" onClick={onDownload}>
            Download PDF
          </Button>
        )}
        {onSendEmail && (
          <Button leftIcon={<FaEnvelope />} colorScheme="purple" onClick={onSendEmail}>
            Email Receipt
          </Button>
        )}
      </HStack>

      <Box
        ref={receiptRef}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={6}
        boxShadow="md"
        maxW="800px"
        mx="auto"
      >
        {/* Receipt Header */}
        <Flex
          bg={headerBgColor}
          p={4}
          borderRadius="md"
          justifyContent="space-between"
          alignItems="center"
          mb={6}
        >
          <Box>
            {schoolInfo.logo ? (
              <Image
                src={schoolInfo.logo}
                alt={schoolInfo.name}
                maxH="80px"
                objectFit="contain"
              />
            ) : (
              <Text fontSize="2xl" fontWeight="bold">
                {schoolInfo.name}
              </Text>
            )}
            <Text fontSize="sm">{schoolInfo.address}</Text>
            <Text fontSize="sm">
              {schoolInfo.phone} | {schoolInfo.email}
            </Text>
          </Box>
          <VStack align="flex-end" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              Fee Receipt
            </Text>
            <Text fontWeight="medium">#{receipt.receiptNumber}</Text>
            <Text fontSize="sm">Date: {formatDate(receipt.paymentDate)}</Text>
          </VStack>
        </Flex>

        {/* Student Information */}
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Student Information
          </Text>
          <Divider mb={3} />
          <Flex flexWrap="wrap">
            <Box flex="1" minW="200px" mb={3}>
              <Text fontWeight="medium">Name:</Text>
              <Text>{receipt.studentName}</Text>
            </Box>
            <Box flex="1" minW="200px" mb={3}>
              <Text fontWeight="medium">Roll Number:</Text>
              <Text>{receipt.rollNumber}</Text>
            </Box>
            <Box flex="1" minW="200px" mb={3}>
              <Text fontWeight="medium">Class:</Text>
              <Text>
                {receipt.class} - {receipt.section}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Payment Details */}
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Payment Details
          </Text>
          <Divider mb={3} />
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Description</Th>
                  <Th>Fee Structure</Th>
                  <Th>Installment</Th>
                  <Th isNumeric>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Tuition Fee</Td>
                  <Td>{receipt.feeStructureTitle}</Td>
                  <Td>{receipt.installmentLabel}</Td>
                  <Td isNumeric>{formatCurrency(receipt.amount)}</Td>
                </Tr>
                {/* Add more rows if needed for additional fee components */}
              </Tbody>
            </Table>
          </TableContainer>

          <Flex justifyContent="flex-end" mt={4}>
            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              p={3}
              width="200px"
            >
              <Flex justifyContent="space-between">
                <Text fontWeight="bold">Total:</Text>
                <Text fontWeight="bold">{formatCurrency(receipt.amount)}</Text>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Payment Method */}
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Payment Information
          </Text>
          <Divider mb={3} />
          <Flex flexWrap="wrap">
            <Box flex="1" minW="200px" mb={3}>
              <Text fontWeight="medium">Payment Method:</Text>
              <Text>{receipt.paymentMethod}</Text>
            </Box>
            {receipt.transactionId && (
              <Box flex="1" minW="200px" mb={3}>
                <Text fontWeight="medium">Transaction ID:</Text>
                <Text>{receipt.transactionId}</Text>
              </Box>
            )}
            {receipt.paidBy && (
              <Box flex="1" minW="200px" mb={3}>
                <Text fontWeight="medium">Paid By:</Text>
                <Text>{receipt.paidBy}</Text>
              </Box>
            )}
          </Flex>
        </Box>

        {/* Notes */}
        {receipt.notes && (
          <Box mb={6}>
            <Text fontWeight="bold" mb={2}>
              Notes
            </Text>
            <Divider mb={3} />
            <Text>{receipt.notes}</Text>
          </Box>
        )}

        {/* Footer */}
        <Box textAlign="center" mt={10} pt={6} borderTopWidth="1px" borderColor={borderColor}>
          <Text fontSize="sm">
            This is a computer-generated receipt and does not require a signature.
          </Text>
          <Text fontSize="xs" color="gray.500" mt={2}>
            For any queries regarding this receipt, please contact the accounts department.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
