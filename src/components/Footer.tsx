'use client';

import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';
import NextLink from 'next/link';

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: React.ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      borderTop={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text fontSize="2xl" fontWeight="bold">
                Fee Management
              </Text>
            </Box>
            <Text fontSize={'sm'}>
              A comprehensive solution for educational institutions to manage fees, 
              payments, and student financial records.
            </Text>
            <Stack direction={'row'} spacing={6}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'YouTube'} href={'#'}>
                <FaYoutube />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'#'}>
                <FaInstagram />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link as={NextLink} href={'/about'}>About</Link>
            <Link as={NextLink} href={'/contact'}>Contact</Link>
            <Link as={NextLink} href={'/testimonials'}>Testimonials</Link>
            <Link as={NextLink} href={'/pricing'}>Pricing</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link as={NextLink} href={'/help'}>Help Center</Link>
            <Link as={NextLink} href={'/terms'}>Terms of Service</Link>
            <Link as={NextLink} href={'/privacy'}>Privacy Policy</Link>
            <Link as={NextLink} href={'/faq'}>FAQ</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Features</ListHeader>
            <Link as={NextLink} href={'/features/fee-management'}>Fee Management</Link>
            <Link as={NextLink} href={'/features/payment-tracking'}>Payment Tracking</Link>
            <Link as={NextLink} href={'/features/reports'}>Reports & Analytics</Link>
            <Link as={NextLink} href={'/features/notifications'}>Notifications</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text>© {currentYear} Fee Management System. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Use</Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
