import { useState, useEffect } from 'react';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';

export interface Flow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowsResponse {
  success: boolean;
  data: Flow[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export const useFlows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await serverHandler.get('/api/chat_flow/get_mine', {
        params: {
          page: 1,
          size: 100, // Get more flows to ensure we have enough
          search: '',
          sort: 'createdAt',
          order: 'desc'
        }
      });

      const data = response.data as FlowsResponse;
      
      if (data.success) {
        setFlows(data.data || []);
      } else {
        setError('Failed to fetch flows');
      }
    } catch (err: any) {
      console.error('Error fetching flows:', err);
      setError(err.message || 'Failed to fetch flows');
      setFlows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  return {
    flows,
    loading,
    error,
    refetch: fetchFlows
  };
};
