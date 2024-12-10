import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

const projectId = '1558da14b9f93fe89954b32c5e17e840';

// URL de l'icône
const dappIcon = 'https://drive.google.com/file/d/1G6xy7NiVXYgF00iezFJM3B_Id_FSTy2L/view';

// Configuration de Base 
const baseChain = {
  ...base,
  rpcUrls: {
    ...base.rpcUrls,
    default: {
      http: ['https://mainnet.base.org']
    },
    public: {
      http: ['https://mainnet.base.org']
    }
  }
};

export const config = createConfig({
  chains: [baseChain],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Whale in the Box",
        url: window.location.origin,
        iconUrl: dappIcon,
      },
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Whale in the Box',
        description: 'Our Decentralized Betting Platform',
        url: window.location.origin,
        icons: [dappIcon]
      },
      relayUrl: 'wss://relay.walletconnect.org'
    })
  ],
  transports: {
    [base.id]: http()
  },
});