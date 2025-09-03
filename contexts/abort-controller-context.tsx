"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AbortControllerContextType {
  createController: (key: string) => AbortController;
  abortController: (key: string) => void;
  abortAll: () => void;
  getController: (key: string) => AbortController | null;
  isActive: (key: string) => boolean;
}

const AbortControllerContext = createContext<AbortControllerContextType | null>(null);

export const AbortControllerProvider = ({ children }: { children: React.ReactNode }) => {
  const [controllers, setControllers] = useState<Map<string, AbortController>>(new Map());

  const createController = useCallback((key: string) => {
    // Abort existing controller if it exists
    if (controllers.has(key)) {
      controllers.get(key)?.abort();
    }
    
    const newController = new AbortController();
    setControllers(prev => new Map(prev).set(key, newController));
    return newController;
  }, [controllers]);

  const abortController = useCallback((key: string) => {
    const controller = controllers.get(key);
    if (controller) {
      controller.abort();
      setControllers(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, [controllers]);

  const abortAll = useCallback(() => {
    controllers.forEach(controller => controller.abort());
    setControllers(new Map());
  }, [controllers]);

  const getController = useCallback((key: string) => {
    return controllers.get(key) || null;
  }, [controllers]);

  const isActive = useCallback((key: string) => {
    return controllers.has(key);
  }, [controllers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllers.forEach(controller => controller.abort());
    };
  }, [controllers]);

  return (
    <AbortControllerContext.Provider value={{ 
      createController, 
      abortController, 
      abortAll, 
      getController, 
      isActive 
    }}>
      {children}
    </AbortControllerContext.Provider>
  );
};

export const useAbortController = () => {
  const context = useContext(AbortControllerContext);
  if (!context) {
    throw new Error('useAbortController must be used within AbortControllerProvider');
  }
  return context;
};
