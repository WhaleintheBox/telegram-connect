'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi'; 
import { base } from 'wagmi/chains';
import { createAppKit } from '@reown/appkit/react';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  phantomWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';

export const chains = [base];

export const APP_CONFIG = {
  projectIds: {
    reown: "1558da14b9f93fe89954b32c5e17e840",
    walletConnect: "1558da14b9f93fe89954b32c5e17e840"
  },
  metadata: {
    name: 'Whale in the Box',
    description: 'Our Decentralized Betting Platform',
    url: 'https://whaleinthebox.github.io/telegram-connect/dist/',
    iconUrl: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm',
    icons: []
  }
} as const;

// RPC URLs
const RPC_URLS = {
  base: [
    'https://mainnet.base.org',
    'https://1rpc.io/base', 
    'https://base.blockpi.network/v1/rpc/public',
    'https://base.meowrpc.com'
  ]
};

const baseTransport = fallback(
  RPC_URLS.base.map(url => http(url, {
    timeout: 10000,
    retryDelay: 1000,
    retryCount: 3
  }))
);

const storage = createStorage({
  storage: cookieStorage,
  key: 'witb-wallet-storage'
});

const projectId = APP_CONFIG.projectIds.walletConnect;

const walletsList = [
  {
    groupName: 'Popular',
    wallets: [
      metaMaskWallet,
      injectedWallet,
      phantomWallet,
      rainbowWallet
    ].map(wallet => wallet)
  }
];

const connectors = connectorsForWallets(walletsList, {
  appName: APP_CONFIG.metadata.name,
  projectId
});

export const wagmiAdapter = new WagmiAdapter({
  projectId: APP_CONFIG.projectIds.reown,
  networks: [base],
  storage,
  transports: {
    [base.id]: baseTransport
  },
  connectors
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  metadata: {
    ...APP_CONFIG.metadata,
    icons: []
  },
  projectId: APP_CONFIG.projectIds.reown,
  features: {
    analytics: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
    emailShowWallets: true
  }
});

export const config = wagmiAdapter.wagmiConfig;