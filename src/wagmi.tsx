import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { coinbaseWallet, injected, metaMask } from 'wagmi/connectors';
import { createAppKit } from '@reown/appkit/react';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const REOWN_PROJECT_ID = "1558da14b9f93fe89954b32c5e17e840";
export const WALLETCONNECT_PROJECT_ID = "1558da14b9f93fe89954b32c5e17e840";

const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: typeof window !== 'undefined' ? window.location.origin : "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm"]
};

const baseRpcUrls = [
  'https://mainnet.base.org',
  'https://1rpc.io/base',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.meowrpc.com'
];

const baseTransport = fallback(
  baseRpcUrls.map(url => http(url, {
    timeout: 10000,
    retryDelay: 1000,
    retryCount: 3
  }))
);

// Créer un storage persistant avec gestion de l'expiration
const storage = createStorage({
  storage: cookieStorage,
  key: 'witb-wallet-storage',
  deserialize: (value) => {
    try {
      const data = JSON.parse(value);
      // Vérifier si la session a expiré (24h)
      if (data.timestamp && Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  },
  serialize: (value) => {
    return JSON.stringify({
      value,
      timestamp: Date.now(),
    });
  },
});

export const wagmiAdapter = new WagmiAdapter({
  projectId: REOWN_PROJECT_ID,
  networks: [base],
  storage,
  transports: {
    [base.id]: baseTransport
  },
  connectors: [
    injected({ 
      target: 'metaMask'
    }),
    injected({ 
      target: 'phantom'
    }),
    metaMask(),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
  ]
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  metadata,
  projectId: REOWN_PROJECT_ID,
  features: {
    analytics: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
    emailShowWallets: true
  }
});

export const rainbowConfig = getDefaultConfig({
  appName: "Whale in the Box",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [base],
  transports: {
    [base.id]: baseTransport
  },
  storage
});

export const config = wagmiAdapter.wagmiConfig;