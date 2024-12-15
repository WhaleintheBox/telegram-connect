'use client';

import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { config, rainbowConfig } from './wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useConnect } from 'wagmi';
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
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Gestion de la reconnexion automatique
  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined') {
      const lastConnector = localStorage.getItem('witb-last-connector');
      const lastTimestamp = localStorage.getItem('witb-connection-timestamp');
      
      if (lastConnector && lastTimestamp) {
        // Vérifier si la connexion n'a pas expiré (24h)
        const timestamp = parseInt(lastTimestamp);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          const connector = connectors.find(c => c.id === lastConnector);
          if (connector) {
            connect({ connector });
          }
        } else {
          // Nettoyer les données expirées
          localStorage.removeItem('witb-last-connector');
          localStorage.removeItem('witb-connection-timestamp');
        }
      }
    }
  }, [isConnected, connect, connectors]);

  // Gestion de la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastConnector = localStorage.getItem('witb-last-connector');
        if (lastConnector && !isConnected) {
          const connector = connectors.find(c => c.id === lastConnector);
          if (connector) {
            connect({ connector });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, connect, connectors]);

  const openConnectModal = useCallback(async () => {
    try {
      await open({ view: 'Connect' });
      // Sauvegarder les informations de connexion
      localStorage.setItem('witb-connection-timestamp', Date.now().toString());
    } catch (error) {
      console.error('Connection error:', error);
      localStorage.removeItem('witb-last-connector');
      localStorage.removeItem('witb-connection-timestamp');
    }
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