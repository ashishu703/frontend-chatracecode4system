'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { loadFacebookSDK, initFacebookLogin } from '@/lib/facebook';
import serverHandler from '@/utils/serverHandler';

interface WhatsAppProfileSignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void
}

export function WhatsAppProfileSigner({ isOpen, onClose, onSuccess }: WhatsAppProfileSignerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'init' | 'connecting' | 'success' | 'error'>('init');
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setStep('connecting');
      setError(null);

      // Get WhatsApp configuration (same contract as chatrace-front)
      console.log('[WhatsAppProfileSigner] Fetching /api/auth/whatsapp config...');
      const configResponse = await fetch('/api/auth/whatsapp');
      const config = await configResponse.json();
      console.log('[WhatsAppProfileSigner] Config response:', config);
      
      if (!config.success || !config.data?.facebookAppId) {
        throw new Error('Failed to load WhatsApp configuration');
      }

      // Initialize Facebook login for WhatsApp Business
      console.log('[WhatsAppProfileSigner] Initializing FB embedded signup...', {
        appId: config.data.facebookAppId,
        configId: config.data.configId
      });
      const { code } = await initFacebookLogin(config.data.facebookAppId, {
        configId: config.data.configId,
        scope: config.data.scopes,
        responseType: 'code'
      });
      setCode(code);
      console.log('[WhatsAppProfileSigner] Authorization code captured:', code ? `${String(code).slice(0, 6)}...` : null);
    } catch (error: any) {
      console.error('Error during WhatsApp connection:', error);
      setError(
        error.message.includes('User cancelled') 
          ? 'Connection cancelled by user' 
          : error.message || 'Failed to connect to WhatsApp Business'
      );
      setStep('error');
      toast.error(
        error.message.includes('User cancelled') 
          ? 'Connection cancelled' 
          : 'Failed to connect to WhatsApp Business'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for embedded signup completion to capture business_id, waba_id, phone_number_id
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return;
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('[WhatsAppProfileSigner] postMessage received:', payload);
        const { type, event: eventState, data } = payload || {};
        if (type === 'WA_EMBEDDED_SIGNUP' && eventState === 'FINISH' && data) {
          console.log('[WhatsAppProfileSigner] Embedded signup FINISH data:', data);
          setAccountInfo(data);
        }
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, []);

  // When both code and accountInfo are available, finalize auth with backend
  useEffect(() => {
    const finalizeAuth = async () => {
      if (!code || !accountInfo) return;
      try {
        console.log('[WhatsAppProfileSigner] Finalizing auth with backend...', {
          hasCode: !!code,
          business_id: accountInfo?.business_id,
          waba_id: accountInfo?.waba_id,
          phone_number_id: accountInfo?.phone_number_id
        });
        const { data: result }: { data: { success?: boolean; msg?: string; message?: string } } = await serverHandler.post('/api/whatsapp/auth-init', {
          code,
          ...accountInfo
        });
        console.log('[WhatsAppProfileSigner] Backend /api/whatsapp/auth-init result:', result);
        if (result?.success || result?.msg === 'success') {
          setStep('success');
          toast.success('Successfully connected to WhatsApp Business');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        } else {
          throw new Error(result?.message || 'Failed to connect to WhatsApp Business');
        }
      } catch (err: any) {
        console.error('[WhatsAppProfileSigner] Finalize auth error:', err?.message, err?.response?.data);
        setError(err?.message || 'Failed to connect to WhatsApp Business');
        setStep('error');
        toast.error(err?.message || 'Failed to connect to WhatsApp Business');
      }
    };
    finalizeAuth();
  }, [code, accountInfo, onClose, onSuccess]);

  const handleRetry = () => {
    setStep('init');
    setError(null);
  };

  const handleClose = () => {
    if (step === 'connecting') {
      return; // Don't allow closing while connecting
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
              alt="WhatsApp" 
              className="w-6 h-6"
            />
            Connect WhatsApp Business
          </DialogTitle>
          <DialogDescription>
            Connect your WhatsApp Business account to enable messaging automation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'init' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>This will open a Facebook login dialog where you can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Log in with your Facebook account</li>
                  <li>Grant permissions for WhatsApp Business</li>
                  <li>Connect your WhatsApp Business account</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleConnect} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect WhatsApp Business'
                  )}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="space-y-4 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Connecting to WhatsApp Business</p>
                <p className="text-sm text-muted-foreground">
                  Please complete the Facebook login process in the popup window
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
              <div>
                <p className="font-medium text-green-700">Successfully Connected!</p>
                <p className="text-sm text-muted-foreground">
                  Your WhatsApp Business account is now connected and ready to use.
                </p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Connection Failed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {error || 'An error occurred while connecting to WhatsApp Business'}
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

