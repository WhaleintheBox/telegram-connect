'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi'; 
import { base } from 'wagmi/chains';
import { createAppKit } from '@reown/appkit/react';
import { metaMaskWallet, phantomWallet, coinbaseWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

export const chains = [base]; // Exportez ce tableau

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
    version: '1.0.0',
    icons: []
  },
  rpc: {
    base: [
      'https://mainnet.base.org',
      'https://1rpc.io/base', 
      'https://base.blockpi.network/v1/rpc/public',
      'https://base.meowrpc.com'
    ]
  }
} as const;

const baseTransport = fallback(
  APP_CONFIG.rpc.base.map(url => http(url, {
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

const walletConnectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        phantomWallet,
        coinbaseWallet,
        walletConnectWallet
      ],
    },
  ],
  {
    appName: APP_CONFIG.metadata.name,
    projectId
  }
);

export const wagmiAdapter = new WagmiAdapter({
  projectId: APP_CONFIG.projectIds.reown,
  networks: [base],
  storage,
  transports: {
    [base.id]: baseTransport
  },
  connectors: walletConnectors
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  metadata: {
    ...APP_CONFIG.metadata,
    icons: [APP_CONFIG.metadata.iconUrl]
  },
  projectId: APP_CONFIG.projectIds.reown,
  features: {
    analytics: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
    emailShowWallets: true
  }
});

export const config = wagmiAdapter.wagmiConfig;
