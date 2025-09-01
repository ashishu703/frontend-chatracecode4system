"use client";
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';

const AppSettingsContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useQuery<any, Error>({
    queryKey: ['fetch-settings'],
    queryFn: async () => {
      return await serverHandler.get('/api/web/get_web_public');
    },
  });
  const settings = data?.data?.data || {};
  return (
    <AppSettingsContext.Provider value={{ settings, isLoading, error }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
} 