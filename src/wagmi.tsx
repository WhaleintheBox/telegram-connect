import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http, fallback } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

export const projectId = "1558da14b9f93fe89954b32c5e17e840";

if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: "Whale in the Box",
  description: "Our Decentralized Betting Platform",
  url: typeof window !== 'undefined' 
    ? window.location.origin 
    : "https://whaleinthebox.github.io/telegram-connect/dist/",
  icons: ["https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e64de848-991b-4de3-787a-5e6008473800/sm"]
};

const baseRpcUrls = [
  'https://mainnet.base.org',
  'https://1rpc.io/base',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.meowrpc.com'
];

const connectors = [
  walletConnect({
    projectId,
    metadata,
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'dark',
      explorerExcludedWalletIds: [],
      explorerRecommendedWalletIds: [],
      mobileWallets: [{
        id: 'metamask',
        name: 'MetaMask',
        links: {
          native: 'metamask://',
          universal: 'https://metamask.app.link'
        }
      }],
      desktopWallets: [{
        id: 'metamask',
        name: 'MetaMask',
        links: {
          native: 'metamask://',
          universal: 'https://metamask.io'
        }
      }]
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

const baseTransport = fallback(
  baseRpcUrls.map(url => http(url, {
    timeout: 10000,
    retryDelay: 1000,
    retryCount: 3
  }))
);

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

export const config = wagmiAdapter.wagmiConfig;