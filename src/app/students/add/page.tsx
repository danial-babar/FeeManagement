'use client';

import { Container, Box, Heading } from '@chakra-ui/react';
import StudentForm from '@/components/StudentForm';
import PageLayout from '@/app/PageLayout';

export default function AddStudentPage() {
  return (
    <PageLayout>
      <Container maxW="container.lg" py={8}>
        <Box mb={6}>
          <Heading size="lg">Add New Student</Heading>
        </Box>
        <StudentForm />
      </Container>
    </PageLayout>
  );
}
