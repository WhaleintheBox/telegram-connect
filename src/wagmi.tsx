import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

export const projectId = "1558da14b9f93fe89954b32c5e17e840";

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: typeof window !== 'undefined' ? window.location.origin : "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm"]
};

export const networks = [base];

const storage = createStorage({
  storage: cookieStorage
});

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
    showQrModal: false,
    qrModalOptions: {
      themeMode: 'dark',
      explorerExcludedWalletIds: [],
      explorerRecommendedWalletIds: []
    }
  }),
  injected({ 
    shimDisconnect: true
  }),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0],
    headlessMode: true
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

export const wagmiAdapter = new WagmiAdapter({
  storage,
  transports: {
    [base.id]: baseTransport
  },
  connectors,
  networks,
  projectId,
  ssr: false
});

export const config = wagmiAdapter.wagmiConfig;