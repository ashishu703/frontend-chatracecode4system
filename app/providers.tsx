"use client"

import type React from "react"

import { Provider } from "react-redux"
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from "@/store/store"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from "@/contexts/socket-context";
import { AbortControllerProvider } from "@/contexts/abort-controller-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SocketProvider>
            <AbortControllerProvider>
              {children}
            </AbortControllerProvider>
          </SocketProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
