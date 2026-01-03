import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { UserEndpoints } from "../enpointsUtils/Api-endpoints";

export interface ErrorLog {
  id: number;
  errorCode: string;
  platform: string;
  recipient: string;
  errorMessage: string;
  date: string;
  timestamp: string;
  type: "broadcast" | "message";
  broadcastId?: number;
  templateName?: string;
}

export interface ErrorStats {
  totalErrors: number;
  broadcastErrors: number;
  messageErrors: number;
}

export interface ErrorLogsResponse {
  errorLogs: ErrorLog[];
  count: number;
}

export const errorLogsApi = {
  // Get error logs
  getErrorLogs: async (options?: {
    limit?: number;
    offset?: number;
    platform?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ErrorLogsResponse> => {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());
      if (options?.platform) params.append("platform", options.platform);
      if (options?.startDate) params.append("startDate", options.startDate);
      if (options?.endDate) params.append("endDate", options.endDate);

      const queryString = params.toString();
      const url = `/api/user/error_logs${queryString ? `?${queryString}` : ""}`;
      
      const response = await serverHandler.get<ErrorLogsResponse>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to fetch error logs");
    }
  },

  // Get error statistics
  getErrorStats: async (): Promise<ErrorStats> => {
    try {
      const response = await serverHandler.get<ErrorStats>("/api/user/error_logs/stats");
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to fetch error stats");
    }
  },
};

