import { http, createConfig } from 'wagmi';
import { mainnet, zkSync, polygon, arbitrum, avalanche, optimism, base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = '1558da14b9f93fe89954b32c5e17e840';

export const config = createConfig({
  chains: [mainnet, zkSync, polygon, arbitrum, avalanche, optimism, base],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [mainnet.id]: http(),
    [zkSync.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [avalanche.id]: http(),
    [optimism.id]: http(),
    [base.id]: http()
  },
});
