'use client';

import { useState } from 'react';
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
  InputGroup,
  InputLeftAddon,
  Textarea,
  Avatar,
  Center,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface StudentFormProps {
  initialValues?: {
    _id?: string;
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
  };
  isEdit?: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  rollNumber: Yup.string().required('Roll number is required'),
  class: Yup.string().required('Class is required'),
  section: Yup.string().required('Section is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  admissionDate: Yup.date().required('Admission date is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  parentName: Yup.string().required('Parent name is required'),
  parentPhone: Yup.string().required('Parent phone is required'),
  parentEmail: Yup.string().email('Invalid email format').required('Parent email is required'),
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function StudentForm({ initialValues, isEdit = false }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    initialValues?.profileImage || null
  );
  const toast = useToast();
  const router = useRouter();

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      rollNumber: '',
      class: '',
      section: '',
      gender: '',
      dateOfBirth: '',
      admissionDate: new Date().toISOString().split('T')[0],
      email: '',
      phone: '',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      profileImage: '',
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
          ? `${API_BASE_URL}/api/students/${initialValues?._id}`
          : `${API_BASE_URL}/api/students`;
        
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
          title: isEdit ? 'Student updated' : 'Student created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirect to students list
        router.push('/students');
      } catch (error) {
        console.error('Error submitting student form:', error);
        toast({
          title: isEdit ? 'Error updating student' : 'Error creating student',
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server and get a URL back
      // For now, we'll just create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
        formik.setFieldValue('profileImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={formik.handleSubmit}
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading size="lg" mb={6}>
        {isEdit ? 'Edit Student' : 'Add New Student'}
      </Heading>

      <Center mb={6}>
        <Box position="relative">
          <Avatar
            size="2xl"
            src={profileImagePreview || undefined}
            name={formik.values.name || 'Student'}
          />
          <Box position="absolute" bottom="0" right="0">
            <input
              type="file"
              accept="image/*"
              id="profile-image"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="profile-image">
              <IconButton
                as="span"
                aria-label="Upload image"
                icon={<AddIcon />}
                colorScheme="blue"
                rounded="full"
                size="sm"
                cursor="pointer"
              />
            </label>
          </Box>
        </Box>
      </Center>

      <VStack spacing={6} align="stretch">
        <Heading size="md">Basic Information</Heading>
        <Divider />

        <HStack spacing={4}>
          <FormControl
            isInvalid={formik.touched.name && Boolean(formik.errors.name)}
          >
            <FormLabel>Full Name</FormLabel>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={
              formik.touched.rollNumber && Boolean(formik.errors.rollNumber)
            }
          >
            <FormLabel>Roll Number</FormLabel>
            <Input
              name="rollNumber"
              value={formik.values.rollNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.rollNumber}</FormErrorMessage>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl
            isInvalid={formik.touched.class && Boolean(formik.errors.class)}
          >
            <FormLabel>Class</FormLabel>
            <Select
              name="class"
              value={formik.values.class}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Select class"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Class {i + 1}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{formik.errors.class}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={
              formik.touched.section && Boolean(formik.errors.section)
            }
          >
            <FormLabel>Section</FormLabel>
            <Select
              name="section"
              value={formik.values.section}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Select section"
            >
              {['A', 'B', 'C', 'D', 'E'].map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{formik.errors.section}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={formik.touched.gender && Boolean(formik.errors.gender)}
          >
            <FormLabel>Gender</FormLabel>
            <Select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Select gender"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <FormErrorMessage>{formik.errors.gender}</FormErrorMessage>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl
            isInvalid={
              formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)
            }
          >
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              name="dateOfBirth"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.dateOfBirth}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={
              formik.touched.admissionDate && Boolean(formik.errors.admissionDate)
            }
          >
            <FormLabel>Admission Date</FormLabel>
            <Input
              type="date"
              name="admissionDate"
              value={formik.values.admissionDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.admissionDate}</FormErrorMessage>
          </FormControl>
        </HStack>

        <Heading size="md" mt={4}>Contact Information</Heading>
        <Divider />

        <HStack spacing={4}>
          <FormControl
            isInvalid={formik.touched.email && Boolean(formik.errors.email)}
          >
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={formik.touched.phone && Boolean(formik.errors.phone)}
          >
            <FormLabel>Phone</FormLabel>
            <InputGroup>
              <InputLeftAddon>+92</InputLeftAddon>
              <Input
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </InputGroup>
            <FormErrorMessage>{formik.errors.phone}</FormErrorMessage>
          </FormControl>
        </HStack>

        <FormControl
          isInvalid={formik.touched.address && Boolean(formik.errors.address)}
        >
          <FormLabel>Address</FormLabel>
          <Textarea
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
        </FormControl>

        <Heading size="md" mt={4}>Parent/Guardian Information</Heading>
        <Divider />

        <FormControl
          isInvalid={
            formik.touched.parentName && Boolean(formik.errors.parentName)
          }
        >
          <FormLabel>Parent/Guardian Name</FormLabel>
          <Input
            name="parentName"
            value={formik.values.parentName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <FormErrorMessage>{formik.errors.parentName}</FormErrorMessage>
        </FormControl>

        <HStack spacing={4}>
          <FormControl
            isInvalid={
              formik.touched.parentPhone && Boolean(formik.errors.parentPhone)
            }
          >
            <FormLabel>Parent/Guardian Phone</FormLabel>
            <InputGroup>
              <InputLeftAddon>+92</InputLeftAddon>
              <Input
                name="parentPhone"
                value={formik.values.parentPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </InputGroup>
            <FormErrorMessage>{formik.errors.parentPhone}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={
              formik.touched.parentEmail && Boolean(formik.errors.parentEmail)
            }
          >
            <FormLabel>Parent/Guardian Email</FormLabel>
            <Input
              type="email"
              name="parentEmail"
              value={formik.values.parentEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.parentEmail}</FormErrorMessage>
          </FormControl>
        </HStack>

        <HStack spacing={4} justify="flex-end" pt={4}>
          <Button
            variant="outline"
            onClick={() => router.push('/students')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={!formik.isValid || isSubmitting}
          >
            {isEdit ? 'Update Student' : 'Add Student'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
