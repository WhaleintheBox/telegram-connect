import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

const projectId = '1558da14b9f93fe89954b32c5e17e840';

const dappIcon = 'https://drive.google.com/file/d/1G6xy7NiVXYgF00iezFJM3B_Id_FSTy2L/view';  // À remplacer par votre URL d'icône

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
      metadata: {
        name: 'Whale in the Box',
        description: 'Our Decentralized Betting Platform',
        url: window.location.origin,
        icons: [dappIcon]
      },
      showQrModal: true
    })
  ],
  transports: {
    [base.id]: http()
  },
});