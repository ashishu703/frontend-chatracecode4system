import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { UserEndpoints } from "../enpointsUtils/Api-endpoints";

export interface Integration {
  id: number;
  userId: number;
  type: "google_sheets" | "facebook_lead_ads" | "indiamart";
  name: string;
  isConnected: boolean;
  credentials?: any;
  settings?: any;
  webhookUrl?: string;
  webhookSecret?: string;
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectIntegrationRequest {
  type: "google_sheets" | "facebook_lead_ads" | "indiamart";
  name?: string;
  credentials?: any;
  settings?: any;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface IntegrationResponse {
  integration: Integration;
  message?: string;
}

export interface IntegrationsListResponse {
  integrations: Integration[];
  count: number;
}

export const integrationsApi = {
  // Get all integrations
  getAll: async (): Promise<IntegrationsListResponse> => {
    try {
      const response = await serverHandler.get<IntegrationsListResponse>("/api/integration");
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to fetch integrations");
    }
  },

  // Get integration by type
  getByType: async (type: string): Promise<{ integration: Integration | null }> => {
    try {
      const response = await serverHandler.get<{ integration: Integration | null }>(`/api/integration/${type}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to fetch integration");
    }
  },

  // Connect an integration
  connect: async (data: ConnectIntegrationRequest): Promise<IntegrationResponse> => {
    try {
      const response = await serverHandler.post<IntegrationResponse>("/api/integration/connect", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to connect integration");
    }
  },

  // Disconnect an integration
  disconnect: async (type: string): Promise<{ message: string }> => {
    try {
      const response = await serverHandler.post<{ message: string }>("/api/integration/disconnect", { type });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to disconnect integration");
    }
  },

  // Update integration status
  updateStatus: async (type: string, isConnected: boolean, errorMessage?: string): Promise<{ message: string }> => {
    try {
      const response = await serverHandler.post<{ message: string }>("/api/integration/status", {
        type,
        isConnected,
        errorMessage,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to update integration status");
    }
  },

  // Delete an integration
  delete: async (type: string): Promise<{ message: string }> => {
    try {
      const response = await serverHandler.delete<{ message: string }>(`/api/integration?type=${encodeURIComponent(type)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to delete integration");
    }
  },
};

export const apiKeyApi = {
  // Generate API key
  generate: async (): Promise<{ api_key: string }> => {
    try {
      const response = await serverHandler.post<{ api_key: string }>(UserEndpoints.GENERATE_API_KEY);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to generate API key");
    }
  },

  // Get API key
  get: async (): Promise<{ api_key: string | null }> => {
    try {
      const response = await serverHandler.get<{ api_key: string | null }>(UserEndpoints.GET_API_KEY);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to get API key");
    }
  },
};

