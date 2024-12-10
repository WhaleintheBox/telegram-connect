import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = '1558da14b9f93fe89954b32c5e17e840';

// Utilisez une URL d'icône directement accessible (pas Google Drive)
const dappIcon = 'https://votre-domaine.com/chemin-vers-icone.png';

// Configuration de base optimisée
const baseChain = {
 ...base,
 rpcUrls: {
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
   injected({
     target: 'metaMask',
     shimDisconnect: true,
   }),
   walletConnect({
     projectId,
     metadata: {
       name: 'Whale in the Box',
       description: 'Our Decentralized Betting Platform',
       url: window.location.origin,
       icons: [dappIcon]
     }
   })
 ],
 transports: {
   [baseChain.id]: http()
 }
});

export const metadata = {
 name: 'Whale in the Box',
 description: 'Our Decentralized Betting Platform',
 url: window.location.origin,
 icons: [dappIcon]
};