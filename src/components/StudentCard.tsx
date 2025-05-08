'use client';

import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  Badge,
  HStack,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon, ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';

interface StudentCardProps {
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    class: string;
    section?: string;
    admissionDate: string;
    feeStatus: 'paid' | 'partial' | 'unpaid' | 'defaulter';
    email?: string;
    phone?: string;
    parentName?: string;
    profileImage?: string;
  };
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function StudentCard({ 
  student, 
  onEdit, 
  onView, 
  onDelete 
}: StudentCardProps) {
  const statusColors = {
    paid: 'green',
    partial: 'orange',
    unpaid: 'red',
    defaulter: 'red',
  };

  const statusLabels = {
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
    defaulter: 'Defaulter',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Box
      maxW={'320px'}
      w={'full'}
      bg={useColorModeValue('white', 'gray.900')}
      boxShadow={'md'}
      rounded={'lg'}
      p={6}
      textAlign={'center'}
      position={'relative'}
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
    >
      <Avatar
        size={'xl'}
        src={
          student.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            student.name
          )}&background=random`
        }
        mb={4}
        pos={'relative'}
      />
      <Heading fontSize={'2xl'} fontFamily={'body'}>
        {student.name}
      </Heading>
      <Text fontWeight={600} color={'gray.500'} mb={4}>
        Roll No: {student.rollNumber}
      </Text>
      
      <HStack spacing={2} justifyContent="center" mb={4}>
        <Badge colorScheme="blue">Class {student.class}</Badge>
        {student.section && (
          <Badge colorScheme="purple">Section {student.section}</Badge>
        )}
        <Badge colorScheme={statusColors[student.feeStatus]}>
          {statusLabels[student.feeStatus]}
        </Badge>
      </HStack>

      <Stack mt={2} direction={'row'} spacing={4} justifyContent="center">
        <Stack spacing={0} align={'center'}>
          <Text fontWeight={600}>Admission</Text>
          <Text fontSize={'sm'} color={'gray.500'}>
            {formatDate(student.admissionDate)}
          </Text>
        </Stack>
        {student.parentName && (
          <Stack spacing={0} align={'center'}>
            <Text fontWeight={600}>Parent</Text>
            <Text fontSize={'sm'} color={'gray.500'}>
              {student.parentName}
            </Text>
          </Stack>
        )}
      </Stack>

      <Flex justifyContent="center" mt={4}>
        {onView && (
          <Tooltip label="View Details">
            <IconButton
              aria-label="View student"
              icon={<ViewIcon />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              mr={2}
              onClick={() => onView(student._id)}
              as={NextLink}
              href={`/students/${student._id}`}
            />
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip label="Edit Student">
            <IconButton
              aria-label="Edit student"
              icon={<EditIcon />}
              size="sm"
              colorScheme="green"
              variant="ghost"
              mr={2}
              onClick={() => onEdit(student._id)}
              as={NextLink}
              href={`/students/edit/${student._id}`}
            />
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip label="Delete Student">
            <IconButton
              aria-label="Delete student"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(student._id)}
            />
          </Tooltip>
        )}
      </Flex>
    </Box>
  );
}
