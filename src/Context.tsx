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

const STORAGE_KEYS = {
  CONNECTOR: 'witb-last-connector',
  SESSION: 'witb-session'
} as const;

const SESSION_DURATION = 24 * 60 * 60 * 1000;

type Platform = 'mobile' | 'desktop';
type ModalContextType = {
  openConnectModal: () => Promise<void>;
  isSessionActive: boolean;
  platform: Platform;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ContextProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [isSessionActive, setIsSessionActive] = useState(false);

  const detectPlatform = useCallback(() => {
    if (typeof window === 'undefined') return 'desktop';
    return /mobile|android|iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    ) ? 'mobile' : 'desktop';
  }, []);

  const checkSession = useCallback(() => {
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return false;
    try {
      const { timestamp } = JSON.parse(sessionData);
      const isValid = Date.now() - timestamp < SESSION_DURATION;
      setIsSessionActive(isValid);
      return isValid;
    } catch {
      return false;
    }
  }, []);

  const updateSession = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
      timestamp: Date.now()
    }));
    setIsSessionActive(true);
  }, []);

  const handleAutoConnect = useCallback(async () => {
    if (!isConnected && checkSession()) {
      const lastConnector = localStorage.getItem(STORAGE_KEYS.CONNECTOR);
      if (lastConnector) {
        const connector = connectors.find(c => c.id === lastConnector);
        if (connector) {
          try {
            await connect({ connector });
            updateSession();
          } catch (error) {
            console.error('Auto-connect failed:', error);
          }
        }
      }
    }
  }, [isConnected, connect, connectors, checkSession, updateSession]);

  useEffect(() => {
    setPlatform(detectPlatform());
    handleAutoConnect();
  }, [detectPlatform, handleAutoConnect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleAutoConnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleAutoConnect]);

  const openConnectModal = useCallback(async () => {
    try {
      await open({ view: 'Connect' });
      updateSession();
    } catch (error) {
      console.error('Connection error:', error);
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      setIsSessionActive(false);
    }
  }, [open, updateSession]);

  return (
    <WagmiProvider config={platform === 'mobile' ? rainbowConfig : config}>
      <QueryClientProvider client={queryClient}>
        {platform === 'mobile' ? (
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
            <ModalContext.Provider value={{ openConnectModal, isSessionActive, platform }}>
              {children}
            </ModalContext.Provider>
          </RainbowKitProvider>
        ) : (
          <ModalContext.Provider value={{ openConnectModal, isSessionActive, platform }}>
            {children}
          </ModalContext.Provider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export const useConnectModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useConnectModal must be used within a ContextProvider');
  }
  return context;
};