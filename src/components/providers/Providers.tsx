"use client";

import { ApolloProvider } from '@apollo/client';
import { getApolloClient } from '@/lib/apollo-client';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Toaster } from 'sonner';
import { AppProviders } from '@/features/data/AppProviders';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const client = getApolloClient();

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </AuthProvider>
    </ApolloProvider>
  );
} 