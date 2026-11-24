import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (err: string) => void;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
  disabled?: boolean;
  isLoading?: boolean;
  portal?: 'customer' | 'admin';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
  isLoading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '859140870913-uu2j7n6cilpg9k4m7ec6aos2da6m542r.apps.googleusercontent.com';

  useEffect(() => {
    let checkInterval: any = null;

    const initGis = () => {
      if (!window.google?.accounts?.id) return false;

      try {
        if (clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              if (response?.credential) {
                onSuccess(response.credential);
              } else {
                onError?.('Google authentication was cancelled.');
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(containerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: text,
              logo_alignment: 'left',
              width: containerRef.current.offsetWidth || 340
            });
          }
        }
        setGisLoaded(true);
        return true;
      } catch (err: any) {
        console.warn('[GIS Init Notice]:', err.message);
        return false;
      }
    };

    if (!initGis()) {
      checkInterval = setInterval(() => {
        if (initGis()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, text, onSuccess, onError]);

  const handleFallbackClick = () => {
    if (disabled || isLoading) return;

    if (!clientId) {
      onError?.('Google Client ID is not configured. Set VITE_GOOGLE_CLIENT_ID in .env');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onError?.('Google Identity Services is loading. Please check your internet connection.');
    }
  };

  return (
    <div className="w-full relative">
      {isLoading ? (
        <div className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center space-x-2 text-slate-700 font-bold text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
          <span>Verifying with Google...</span>
        </div>
      ) : (
        <>
          {/* Official Google GIS Button Container */}
          <div
            ref={containerRef}
            className={`w-full flex justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          />

          {/* Fallback Styled Button if GIS renderButton is loading or not yet rendered */}
          {(!gisLoaded || !containerRef.current?.hasChildNodes()) && (
            <button
              type="button"
              onClick={handleFallbackClick}
              disabled={disabled || isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-3 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
