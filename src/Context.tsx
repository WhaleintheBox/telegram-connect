'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, Config } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId } from './wagmi';
import { base } from '@reown/appkit/networks';

// Création du QueryClient avec configuration optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Validation du projectId
if (!projectId) {
  throw new Error('Project ID is not defined - Please check your environment variables');
}

// Configuration des métadonnées de l'application
const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: typeof window !== 'undefined' 
    ? window.location.origin 
    : "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm"]
};

// Configuration d'AppKit avec toutes les fonctionnalités nécessaires
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
  }
});

// Provider pour l'application
export function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}