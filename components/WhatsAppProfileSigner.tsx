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

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setStep('connecting');
      setError(null);

      // Get WhatsApp configuration
      const configResponse = await fetch('/api/whatsapp/config');
      const config = await configResponse.json();
      
      if (!config.success || !config.data?.facebookAppId) {
        throw new Error('Failed to load WhatsApp configuration');
      }

      // Initialize Facebook login for WhatsApp Business
      const { code } = await initFacebookLogin(config.data.facebookAppId, {
        configId: config.data.configId,
        scope: config.data.scopes,
        responseType: 'code'
      });

      // Exchange the code via backend (port 6400) using serverHandler and include redirect_uri
      const redirect_uri = `${window.location.origin}/api/user/auth/whatsapp/callback`;
      const { data: result }: { data: { success?: boolean; message?: string } } = await serverHandler.post('/api/whatsapp/auth_init', {
        code,
        redirect_uri,
        accountInfo: {
          platform: 'whatsapp_business',
          connected_at: new Date().toISOString()
        }
      });
      
      if (result.success) {
        setStep('success');
        toast.success('Successfully connected to WhatsApp Business');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to connect to WhatsApp Business');
      }
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

