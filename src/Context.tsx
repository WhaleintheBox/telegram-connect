'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, Config } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId, metadata } from './wagmi';
import { base } from '@reown/appkit/networks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  metadata,
  networks: [base],
  defaultNetwork: base,
  chainImages: {
    [base.id]: metadata.icons[0],
  },
  allWallets: 'SHOW',
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook'],
    allWallets: true,
    legalCheckbox: true,
    onramp: true,
    swaps: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#2563eb',
    '--w3m-color-mix-strength': 20
  }
});

export function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}