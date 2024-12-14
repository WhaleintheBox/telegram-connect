'use client';

import { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';

export default function AuthCallback() {
  const appKit = useAppKit();
  const { isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('callback') || '/';
        const action = searchParams.get('action');
        const walletConnect = searchParams.get('wallet_connect');

        // Gestion spécifique de Telegram
        if (walletConnect === 'true') {
          const savedUrl = localStorage.getItem('telegram_return_url');
          if (savedUrl) {
            localStorage.removeItem('telegram_return_url');
            // Ajout d'un paramètre pour indiquer une connexion réussie
            const returnUrl = new URL(savedUrl);
            returnUrl.searchParams.set('wallet_connected', 'true');
            window.location.href = returnUrl.toString();
            return;
          }
        }

        // Si déjà connecté, rediriger directement
        if (isConnected) {
          window.location.href = redirectUrl;
          return;
        }

        // Ouvrir le modal de connexion si nécessaire
        if (action === 'connect') {
          await appKit.open({
            view: 'Connect'
          });

          // Attendre un court instant pour la connexion
          await new Promise(resolve => setTimeout(resolve, 500));

          if (isConnected) {
            window.location.href = redirectUrl;
          } else {
            setError('Connection failed');
          }
        } else {
          // Si pas d'action spécifique, rediriger vers la page d'accueil
          window.location.href = redirectUrl;
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirection avec erreur après un délai
        setTimeout(() => {
          window.location.href = '/?error=auth_failed';
        }, 2000);
      }
    };

    handleCallback();
  }, [appKit, isConnected]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-500">{error}</div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Finalizing connection...</p>
          </>
        )}
      </div>
    </div>
  );
}