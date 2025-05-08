'use client';

import { ReactNode } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Layout from '@/components/Layout';

// Define theme customizations
const theme = extendTheme({
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#B3E0FF',
      200: '#80CBFF',
      300: '#4DB5FF',
      400: '#1A9FFF',
      500: '#0088FF', // Primary brand color
      600: '#006ECC',
      700: '#005499',
      800: '#003A66',
      900: '#001F33',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'sm',
        },
      },
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider theme={theme}>
      {/* We only want to apply the Layout to pages, not to auth screens */}
      {children}
    </ChakraProvider>
  );
}
