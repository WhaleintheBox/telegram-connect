import { useEffect } from 'react';
import { modal } from '../../Context';

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer les paramètres d'authentification
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('callback') || '/';

        // Ouvrir le modal avec les paramètres d'authentification
        await modal.open({
          view: 'Connect'
        });
        
        // Redirection vers la page de callback
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Error handling authentication:', error);
        // Redirection avec erreur
        window.location.href = '/?error=auth_callback_failed';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Finalizing authentication...</p>
      </div>
    </div>
  );
}