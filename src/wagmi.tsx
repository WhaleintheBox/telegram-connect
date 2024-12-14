import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';
import { createAppKit } from '@reown/appkit/react';

export const projectId = "1558da14b9f93fe89954b32c5e17e840";

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: typeof window !== 'undefined' ? window.location.origin : "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm"]
};

// RPC URLs de secours pour Base
const baseRpcUrls = [
  'https://mainnet.base.org',
  'https://1rpc.io/base',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.meowrpc.com'
];

// Configure les connecteurs
const connectors = [
  walletConnect({ 
    projectId, 
    metadata,
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'dark',
      explorerExcludedWalletIds: [],
      explorerRecommendedWalletIds: [],
      mobileWallets: [
        {
          id: 'metamask',
          name: 'MetaMask',
          links: {
            native: 'metamask://',
            universal: 'https://metamask.app.link'
          }
        }
      ],
      desktopWallets: [
        {
          id: 'metamask',
          name: 'MetaMask',
          links: {
            native: 'metamask://',
            universal: 'https://metamask.io'
          }
        }
      ]
    }
  }),
  injected({ 
    shimDisconnect: true
  }),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0],
    headlessMode: false
  })
];

// Crée un transport avec fallback pour Base
const baseTransport = fallback(
  baseRpcUrls.map(url => http(url, {
    timeout: 10000,
    retryDelay: 1000,
    retryCount: 3
  }))
);

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base],
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [base.id]: baseTransport
  },
  connectors
});

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  metadata,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#2563eb',
    '--w3m-color-mix-strength': 20
  }
});

// Export la config wagmi pour l'application
export const config = wagmiAdapter.wagmiConfig;