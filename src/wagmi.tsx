'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi'; 
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask } from 'wagmi/connectors';
import { createAppKit } from '@reown/appkit/react';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

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

// Retrait de la sérialisation personnalisée
const storage = createStorage({
  storage: cookieStorage,
  key: 'witb-wallet-storage'
});

const { connectors: rainbowConnectors } = getDefaultWallets({
  appName: APP_CONFIG.metadata.name,
  projectId: APP_CONFIG.projectIds.walletConnect
});

const connectors = [
  metaMask({
    dappMetadata: {
      name: APP_CONFIG.metadata.name,
      url: APP_CONFIG.metadata.url,
      iconUrl: APP_CONFIG.metadata.iconUrl
    }
  }),
  injected({
    target: 'phantom',
    shimDisconnect: true
  }),
  coinbaseWallet({
    appName: APP_CONFIG.metadata.name,
    appLogoUrl: APP_CONFIG.metadata.iconUrl
  })
]; 

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
    icons: [APP_CONFIG.metadata.iconUrl]
  },
  projectId: APP_CONFIG.projectIds.reown,
  features: {
    analytics: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
    emailShowWallets: true
  }
});

export const rainbowConfig = {
  chains: [base],
  transports: {
    [base.id]: baseTransport
  },
  connectors: rainbowConnectors 
};

export const config = wagmiAdapter.wagmiConfig;
