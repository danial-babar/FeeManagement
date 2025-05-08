'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll just simulate a successful login
      // In a real app, you would validate credentials with your backend
      
      // Simple validation
      if (!email || !password) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store token in localStorage (in a real app, this would come from your backend)
      localStorage.setItem('token', 'demo-token-123456');
      localStorage.setItem('user', JSON.stringify({
        name: 'Admin User',
        email: email,
        role: 'admin'
      }));
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the Fee Management System',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
          as="form"
          onSubmit={handleSubmit}
        >
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement h={'full'}>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant={'ghost'}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}
              >
                <NextLink href="/forgot-password" passHref>
                  <Text color={'blue.400'}>Forgot password?</Text>
                </NextLink>
              </Stack>
              <Button
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                type="submit"
                isLoading={isLoading}
              >
                Sign in
              </Button>
              <Text align="center">
                Don't have an account?{' '}
                <NextLink href="/register" passHref>
                  <Text as="span" color="blue.400">
                    Sign up
                  </Text>
                </NextLink>
              </Text>
              
              {/* For demo purposes - quick login without form */}
              <Button 
                variant="outline" 
                colorScheme="blue"
                onClick={() => {
                  localStorage.setItem('token', 'demo-token-123456');
                  localStorage.setItem('user', JSON.stringify({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin'
                  }));
                  toast({
                    title: 'Demo login successful',
                    description: 'Logged in with demo account',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  router.push('/dashboard');
                }}
              >
                Demo Login (Skip Form)
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
