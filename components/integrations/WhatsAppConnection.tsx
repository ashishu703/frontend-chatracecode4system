'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { WhatsAppProfileSigner } from '@/components/WhatsAppProfileSigner';

interface WhatsAppConnectionProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function WhatsAppConnection({ onConnect, onDisconnect }: WhatsAppConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[WhatsAppConnection] Checking connection status via /api/whatsapp/accounts');
      const resp = await serverHandler.get('/api/whatsapp/accounts');
      console.log('[WhatsAppConnection] /api/whatsapp/accounts response:', resp?.data);
      const data: any = resp?.data || {};
      
      if (data && (data.success !== undefined ? data.success : true)) {
        // Mirror chatrace-front: backend returns { profiles }
        const profiles = Array.isArray(data.profiles) ? data.profiles : (data.data && Array.isArray(data.data.profiles) ? data.data.profiles : []);
        console.log('[WhatsAppConnection] Profiles length:', profiles?.length || 0);
        setIsConnected((profiles?.length || 0) > 0);
      } else {
        console.error('Failed to check connection status:', (data && data.message) || 'unknown error');
        toast.error('Failed to check WhatsApp connection status');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      toast.error('Failed to check WhatsApp connection status');
    } finally {
      setIsLoading(false);
    }
  }, []);



  const handleConnect = () => {
    setShowWhatsAppDialog(true);
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your WhatsApp Business account? This will stop all message delivery.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp/disconnect', { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        toast.success('Successfully disconnected from WhatsApp Business');
        onDisconnect?.();
      } else {
        throw new Error(data.message || 'Failed to disconnect from WhatsApp Business');
      }
    } catch (error: any) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error(error.message || 'Failed to disconnect from WhatsApp Business');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppSuccess = () => {
    setIsConnected(true);
    onConnect?.();
  };

  const handleRefreshStatus = async () => {
    try {
      setIsRefreshing(true);
      await checkConnectionStatus();
      toast.success('Connection status refreshed');
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium flex items-center gap-2">
            WhatsApp Business
            <button 
              onClick={handleRefreshStatus} 
              disabled={isRefreshing}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </h3>
          <p className="text-sm text-muted-foreground">
            {isConnected 
              ? 'Connected to WhatsApp Business' 
              : 'Connect your WhatsApp Business account to send and receive messages'}
          </p>
        </div>
        
        {isConnected ? (
          <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={isLoading}
            className="space-x-2 bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Disconnecting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Disconnect</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="space-x-2 bg-primary/90 hover:bg-primary"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Connect</span>
          </Button>
        )}
      </div>
      
      <WhatsAppProfileSigner
        isOpen={showWhatsAppDialog}
        onClose={() => setShowWhatsAppDialog(false)}
        onSuccess={handleWhatsAppSuccess}
      />
      
      {isConnected && (
        <div className="mt-2 p-3 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
          <div className="flex items-start">
            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Connected to WhatsApp Business</p>
              <p className="text-xs opacity-80 mt-1">
                Your account is connected and ready to send/receive messages.
              </p>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
