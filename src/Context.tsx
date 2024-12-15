'use client';

import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { config } from './wagmi'; // Importez chains au lieu de APP_CONFIG
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import type { ReactNode } from 'react';
import { ethers } from 'ethers';

const queryClient = new QueryClient();

const STORAGE_KEYS = {
  SESSION: 'witb-session',
  LAST_CONNECT: 'witb-last-connect'
} as const;

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

type Platform = 'mobile' | 'desktop';
type ModalContextType = {
  openConnectModal: () => Promise<void>;
  isSessionActive: boolean;
  platform: Platform;
  executeMobileTransaction: (config: {
    to: string;
    data: string;
    value?: string;
    gasLimit?: number;
  }) => Promise<any>;
  executeMobileTokenApproval: (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    tokenAbi: any
  ) => Promise<any>;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ContextProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const [isSessionActive, setIsSessionActive] = useState(false);

  const detectPlatform = useCallback(() => {
    if (typeof window === 'undefined') return 'desktop';
    return /mobile|android|iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    ) ? 'mobile' : 'desktop';
  }, []);

  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return false;
   
    try {
      const { timestamp } = JSON.parse(sessionData);
      const isValid = Date.now() - timestamp < SESSION_DURATION;
      setIsSessionActive(isValid);
      if (!isValid) {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      }
      return isValid;
    } catch {
      return false;
    }
  }, []);

  const updateSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sessionData = {
      timestamp: Date.now(),
      lastConnect: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
    setIsSessionActive(true);
  }, []);

  // Platform detection
  useEffect(() => {
    setPlatform(detectPlatform());
  }, [detectPlatform]);

  // Session check on mount and connection change
  useEffect(() => {
    if (isConnected) {
      updateSession();
    } else {
      checkSession();
    }
  }, [isConnected, updateSession, checkSession]);

  // Visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkSession]);

  const openConnectModal = useCallback(async () => {
    try {
      await open({ view: 'Connect' });
      updateSession();
    } catch (error) {
      console.error('Connection error:', error);
      if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      }
      setIsSessionActive(false);
    }
  }, [open, updateSession]);

  const executeMobileTransaction = useCallback(async (config: {
    to: string;
    data: string;
    value?: string;
    gasLimit?: number;
  }) => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const gasLimit = platform === 'mobile' ? 400000 : 300000;

      const tx = await signer.sendTransaction({
        to: config.to,
        data: config.data,
        value: config.value || '0',
        gasLimit: config.gasLimit || gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (err: any) {
      console.error('Transaction error:', err);
      throw err;
    }
  }, [platform]);

  const executeMobileTokenApproval = useCallback(async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    tokenAbi: any
  ) => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const gasLimit = platform === 'mobile' ? 150000 : 100000;

      const tx = await tokenContract.approve(spenderAddress, amount, {
        gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (err: any) {
      console.error('Approval error:', err);
      throw err;
    }
  }, [platform]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize={platform === 'mobile' ? 'compact' : 'wide'}
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
          <ModalContext.Provider value={{ 
            openConnectModal, 
            isSessionActive, 
            platform,
            executeMobileTransaction,
            executeMobileTokenApproval 
          }}>
            {children}
          </ModalContext.Provider>
        </RainbowKitProvider>
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
