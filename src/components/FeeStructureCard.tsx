'use client';

import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  useColorModeValue,
  HStack,
  VStack,
  Progress,
  Flex,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import NextLink from 'next/link';

interface Installment {
  _id: string;
  label: string;
  amount: number;
  dueDate: string;
  isPaid?: boolean;
}

interface FeeStructureCardProps {
  feeStructure: {
    _id: string;
    title: string;
    description?: string;
    totalAmount: number;
    academicYear: string;
    applicableClasses: string[];
    installments: Installment[];
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  showInstallments?: boolean;
  collectionStats?: {
    collected: number;
    pending: number;
    percentageCollected: number;
  };
}

export default function FeeStructureCard({
  feeStructure,
  onEdit,
  onDelete,
  onView,
  showInstallments = false,
  collectionStats,
}: FeeStructureCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('blue.600', 'blue.300');

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

  // Sort installments by due date
  const sortedInstallments = [...feeStructure.installments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <Box
      w="full"
      bg={bgColor}
      boxShadow={'md'}
      rounded={'lg'}
      p={6}
      overflow={'hidden'}
      position={'relative'}
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
      borderLeft="4px solid"
      borderLeftColor="blue.400"
    >
      <Box position="absolute" top={3} right={3}>
        <HStack spacing={1}>
          {onView && (
            <Tooltip label="View Details">
              <IconButton
                aria-label="View fee structure"
                icon={<ViewIcon />}
                size="sm"
                colorScheme="blue"
                variant="ghost"
                onClick={() => onView(feeStructure._id)}
                as={NextLink}
                href={`/fee-structures/${feeStructure._id}`}
              />
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip label="Edit Fee Structure">
              <IconButton
                aria-label="Edit fee structure"
                icon={<EditIcon />}
                size="sm"
                colorScheme="green"
                variant="ghost"
                onClick={() => onEdit(feeStructure._id)}
                as={NextLink}
                href={`/fee-structures/edit/${feeStructure._id}`}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip label="Delete Fee Structure">
              <IconButton
                aria-label="Delete fee structure"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(feeStructure._id)}
              />
            </Tooltip>
          )}
        </HStack>
      </Box>

      <Heading
        color={headingColor}
        fontSize={'xl'}
        fontFamily={'body'}
        mb={2}
        pr={20} // Make room for the action buttons
      >
        {feeStructure.title}
      </Heading>

      <HStack spacing={2} mb={3}>
        <Badge colorScheme="blue">{feeStructure.academicYear}</Badge>
        <Badge colorScheme="purple">
          {feeStructure.applicableClasses.length} Classes
        </Badge>
      </HStack>

      {feeStructure.description && (
        <Text color={'gray.500'} fontSize="sm" mb={4} noOfLines={2}>
          {feeStructure.description}
        </Text>
      )}

      <Stack direction={'row'} spacing={4} mb={4}>
        <Stack spacing={0} align={'start'}>
          <Text fontSize="sm" color={'gray.500'}>
            Total Amount
          </Text>
          <Text fontWeight={600} fontSize="lg">
            {formatCurrency(feeStructure.totalAmount)}
          </Text>
        </Stack>
        <Stack spacing={0} align={'start'}>
          <Text fontSize="sm" color={'gray.500'}>
            Installments
          </Text>
          <Text fontWeight={600}>{feeStructure.installments.length}</Text>
        </Stack>
        <Stack spacing={0} align={'start'}>
          <Text fontSize="sm" color={'gray.500'}>
            Created
          </Text>
          <Text fontWeight={600}>{formatDate(feeStructure.createdAt)}</Text>
        </Stack>
      </Stack>

      {collectionStats && (
        <Box mb={4}>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm">Collection Progress</Text>
            <Text fontSize="sm" fontWeight="bold">
              {collectionStats.percentageCollected}%
            </Text>
          </HStack>
          <Progress
            value={collectionStats.percentageCollected}
            colorScheme="green"
            size="sm"
            borderRadius="full"
          />
          <HStack justify="space-between" mt={2} fontSize="xs" color="gray.500">
            <Text>Collected: {formatCurrency(collectionStats.collected)}</Text>
            <Text>Pending: {formatCurrency(collectionStats.pending)}</Text>
          </HStack>
        </Box>
      )}

      {showInstallments && sortedInstallments.length > 0 && (
        <>
          <Divider my={3} />
          <Text fontWeight="semibold" mb={2}>
            Installments
          </Text>
          <List spacing={2}>
            {sortedInstallments.map((installment) => (
              <ListItem key={installment._id}>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <ListIcon
                      as={installment.isPaid ? CheckCircleIcon : TimeIcon}
                      color={installment.isPaid ? 'green.500' : 'orange.500'}
                    />
                    <Text fontSize="sm">{installment.label}</Text>
                  </HStack>
                  <HStack spacing={4}>
                    <Text fontSize="sm" fontWeight="medium">
                      {formatCurrency(installment.amount)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Due: {formatDate(installment.dueDate)}
                    </Text>
                    <Badge
                      colorScheme={installment.isPaid ? 'green' : 'orange'}
                      fontSize="xs"
                    >
                      {installment.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </HStack>
                </Flex>
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Text fontSize="xs" color="gray.500" mt={4}>
        Last updated: {formatDate(feeStructure.updatedAt)}
      </Text>
    </Box>
  );
}
