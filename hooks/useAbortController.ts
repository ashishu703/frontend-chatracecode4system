import { useCallback } from 'react';
import { useAbortController as useAbortControllerContext } from '@/contexts/abort-controller-context';

export interface UseAbortControllerReturn {
  createController: (key: string) => AbortController;
  abortController: (key: string) => void;
  abortAll: () => void;
  getController: (key: string) => AbortController | null;
  isActive: (key: string) => boolean;
  withAbort: <T>(key: string, asyncFn: (signal: AbortSignal) => Promise<T>) => Promise<T>;
}

export const useAbortController = (): UseAbortControllerReturn => {
  const context = useAbortControllerContext();

  const withAbort = useCallback(async <T>(
    key: string, 
    asyncFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T> => {
    const controller = context.createController(key);
    
    try {
      return await asyncFn(controller.signal);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    } finally {
      context.abortController(key);
    }
  }, [context]);

  return {
    ...context,
    withAbort
  };
};
