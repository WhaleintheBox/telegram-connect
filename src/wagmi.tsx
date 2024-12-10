import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = '1558da14b9f93fe89954b32c5e17e840';

export const config = createConfig({
  chains: [base], // Focus uniquement sur Base
  connectors: [
    injected({
      shimDisconnect: true,
    }), 
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Whale in the Box',
        description: 'Betting Platform',
        url: window.location.origin,
        icons: ['https://drive.google.com/file/d/1G6xy7NiVXYgF00iezFJM3B_Id_FSTy2L/view']
      }
    })
  ],
  transports: {
    [base.id]: http()
  },
});