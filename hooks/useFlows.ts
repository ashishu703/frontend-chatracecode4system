import { useState, useEffect } from 'react';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { Flow, FlowsResponse } from '@/types/chatbot/chatBotModel';
import { ChatFlowEndpoints } from '@/utils/api/enpointsUtils/Api-endpoints';
import { PaginationInfo } from '@/types/api/common';

export const useFlows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
  });

  const fetchFlows = async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sort?: string;
    order?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page: params?.page || pagination.currentPage,
        size: params?.size || pagination.pageSize,
        search: params?.search || '',
        sort: params?.sort || 'createdAt',
        order: params?.order || 'desc'
      };

      const response = await serverHandler.get(ChatFlowEndpoints.GET_MINE_FLOWS, {
        params: requestParams
      });
      const data = response.data as FlowsResponse;
      console.log(data);
      if (data.success) {
        setFlows(data.data || []);
        setPagination(data.pagination);
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

  // Delete flow function
  const deleteFlow = async (id: number, flowId: string) => {
    try {
      const response = await serverHandler.post(ChatFlowEndpoints.DELETE_FLOW, {
        id,
        flowId
      });
      const data = response.data as any;
      if (data.success) {
        await fetchFlows();
        return { success: true };
      } else {
        return { success: false, error: data.msg || 'Failed to delete flow' };
      }
    } catch (err: any) {
      console.error('Error deleting flow:', err);
      return { success: false, error: err.message || 'Failed to delete flow' };
    }
  };

  // Create flow function
  const createFlow = async (flowData: any) => {
    try {
      const response = await serverHandler.post(ChatFlowEndpoints.CREATE_FLOW, flowData);
      const data = response.data as any;
      if (data.success) {
        await fetchFlows();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.msg || 'Failed to create flow' };
      }
    } catch (err: any) {
      console.error('Error creating flow:', err);
      return { success: false, error: err.message || 'Failed to create flow' };
    }
  };

  // Update flow function
  const updateFlow = async (flowData: any) => {
    try {
      const response = await serverHandler.post(ChatFlowEndpoints.UPDATE_FLOW, flowData);
      const data = response.data as any;
      if (data.success) {
        await fetchFlows();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.msg || 'Failed to update flow' };
      }
    } catch (err: any) {
      console.error('Error updating flow:', err);
      return { success: false, error: err.message || 'Failed to update flow' };
    }
  };

  // Get flow by ID function
  const getFlowById = async (flowId: string) => {
    try {
      const response = await serverHandler.get(`${ChatFlowEndpoints.GET_BY_FLOW_ID}?flow_id=${flowId}`);
      const data = response.data as any;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.msg || 'Failed to get flow' };
      }
    } catch (err: any) {
      console.error('Error getting flow:', err);
      return { success: false, error: err.message || 'Failed to get flow' };
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  return {
    flows,
    loading,
    error,
    pagination,
    refetch: fetchFlows,
    deleteFlow,
    createFlow,
    updateFlow,
    getFlowById
  };
};
