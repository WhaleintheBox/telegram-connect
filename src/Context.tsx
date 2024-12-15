'use client';

import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { config, rainbowConfig } from './wagmi';
import { useAppKit } from '@reown/appkit/react';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

const detectPlatform = () => {
  if (typeof window === 'undefined') return 'desktop';
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /mobile|android|iphone|ipad|ipod/.test(userAgent) ? 'mobile' : 'desktop';
};

// Créer un contexte pour exposer la fonction de connexion
type ModalContextType = {
  openConnectModal: () => Promise<void>;
};

const ModalContext = createContext<ModalContextType | null>(null);

// Hook personnalisé pour utiliser le contexte
export const useConnectModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useConnectModal must be used within a ContextProvider');
  }
  return context;
};

type ProviderProps = {
  children: ReactNode;
};

export function ContextProvider({ children }: ProviderProps) {
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('desktop');
  const { open } = useAppKit();

  const openConnectModal = useCallback(async () => {
    await open({ view: 'Connect' });
  }, [open]);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const content = (
    <ModalContext.Provider value={{ openConnectModal }}>
      {children}
    </ModalContext.Provider>
  );

  if (platform === 'desktop') {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {content}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return (
    <WagmiProvider config={rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={{
            lightMode: lightTheme({
              accentColor: '#7b3fe4',
              accentColorForeground: 'white',
              borderRadius: 'medium'
            }),
            darkMode: darkTheme({
              accentColor: '#7b3fe4',
              accentColorForeground: 'white',
              borderRadius: 'medium'
            })
          }}
        >
          {content}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export une fonction helper pour faciliter l'utilisation
export const openConnectModal = async () => {
  if (typeof window !== 'undefined') {
    const modalContext = document.querySelector('[data-modal-context]');
    if (modalContext) {
      const { openConnectModal } = useConnectModal();
      await openConnectModal();
    }
  }
};