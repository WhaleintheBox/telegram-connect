'use client';

import { projectId } from './wagmi';
import { createAppKit } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { WagmiProvider, type Config } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error('Project ID is not defined');
}

const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId
})

const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://whaleinthebox.com/_next/image?url=%2Fimg%2Flogos%2Flogo-wtib.png&w=828&q=75"]
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook'],
    emailShowWallets: true,
  },
  themeMode: 'light',
});



export function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}