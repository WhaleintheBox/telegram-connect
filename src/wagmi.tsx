import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

const projectId = '1558da14b9f93fe89954b32c5e17e840';

export const config = createConfig({
  chains: [base],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Whale in the Box",
        url: window.location.origin,
        iconUrl: "https://drive.google.com/file/d/1G6xy7NiVXYgF00iezFJM3B_Id_FSTy2L/view",
      },
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Whale in the Box',
        description: 'Our Decentralized Betting Platform',
        url: window.location.origin,
        icons: ['https://drive.google.com/file/d/1G6xy7NiVXYgF00iezFJM3B_Id_FSTy2L/view']
      }
    })
  ],
  transports: {
    [base.id]: http()
  },
});