'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Heading, Spinner, Center, useToast } from '@chakra-ui/react';
import StudentForm from '@/components/StudentForm';
import PageLayout from '@/app/PageLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
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
}

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchStudent = async () => {
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
        const response = await axios.get(`${API_BASE_URL}/api/students/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student:', error);
        setError('Failed to load student data');
        toast({
          title: 'Error',
          description: 'Failed to load student data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <PageLayout>
        <Center h="calc(100vh - 200px)">
          <Spinner size="xl" />
        </Center>
      </PageLayout>
    );
  }

  if (error || !student) {
    return (
      <PageLayout>
        <Container maxW="container.lg" py={8}>
          <Heading size="md" color="red.500">
            {error || 'Student not found'}
          </Heading>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxW="container.lg" py={8}>
        <Box mb={6}>
          <Heading size="lg">Edit Student</Heading>
        </Box>
        <StudentForm initialValues={student} isEdit={true} />
      </Container>
    </PageLayout>
  );
}
