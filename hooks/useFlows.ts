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

      const response = await serverHandler.get("/api/chat_flow/get_all");
      const data = response.data as {
        success: boolean;
        data: Array<{
          title: string;
          flow_id: string;
          is_default: boolean;
        }>;
      };

      if (data.success && data.data) {
        // Map the API response to the Flow interface
        const mappedFlows: Flow[] = data.data.map((flow, index) => ({
          id: index + 1, // Generate a temporary ID since API doesn't provide it
          uid: "", // Empty as API doesn't provide
          flow_id: flow.flow_id,
          title: flow.title,
          prevent_list: "", // Empty as API doesn't provide
          ai_list: "", // Empty as API doesn't provide
          createdAt: new Date().toISOString(), // Default value as API doesn't provide
          updatedAt: new Date().toISOString(), // Default value as API doesn't provide
        }));

        // Apply search filter if provided
        let filteredFlows = mappedFlows;
        if (params?.search) {
          const searchTerm = params.search.toLowerCase();
          filteredFlows = mappedFlows.filter(
            (flow) =>
              flow.title.toLowerCase().includes(searchTerm) ||
              flow.flow_id.toLowerCase().includes(searchTerm)
          );
        }

        // Apply sorting if provided
        if (params?.sort) {
          filteredFlows.sort((a, b) => {
            const aValue = a[params.sort as keyof Flow];
            const bValue = b[params.sort as keyof Flow];
            if (aValue === bValue) return 0;
            const comparison = aValue > bValue ? 1 : -1;
            return params?.order === "asc" ? comparison : -comparison;
          });
        }

        // Apply pagination
        const page = params?.page || pagination.currentPage;
        const size = params?.size || pagination.pageSize;
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedFlows = filteredFlows.slice(startIndex, endIndex);

        setFlows(paginatedFlows);
        setPagination({
          totalItems: filteredFlows.length,
          totalPages: Math.ceil(filteredFlows.length / size),
          currentPage: page,
          pageSize: size,
        });
      } else {
        setError("Failed to fetch flows");
        setFlows([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch flows");
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
