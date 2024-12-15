import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import App from './App.tsx';
import './index.css';
import { config, appKit } from './wagmi';
import { ContextProvider } from './Context';

// Initialise AppKit globalement
if (appKit) {
  // L'AppKit est configuré et prêt à être utilisé
  console.log('AppKit initialized');
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <App />
        </ContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);