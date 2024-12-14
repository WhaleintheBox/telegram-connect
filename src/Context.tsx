'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, Config } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId } from './wagmi';
import { base } from '@reown/appkit/networks';

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error('Project ID is not defined');
}

const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: typeof window !== 'undefined' ? window.location.origin : "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm"]
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  metadata,
  networks: [base],
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook'],
    allWallets: true
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