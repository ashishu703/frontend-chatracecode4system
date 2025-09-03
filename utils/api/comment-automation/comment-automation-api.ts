import { FacebookCommentEndpoints, InstagramCommentEndpoints } from '../enpointsUtils/Api-endpoints';

const getToken = () =>
  localStorage.getItem("serviceToken") || localStorage.getItem("adminToken") || "";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4500";

// Types for comment automation settings
export interface CommentAutomationSettings {
  // Private reply settings
  privateReplyType: 'text' | 'flow' | 'none';
  privateReplyText?: string;
  privateReplyFlowId?: string;
  
  // Public reply settings
  publicReplyType: 'text' | 'flow' | 'none';
  publicReplyTexts?: string[];
  publicReplyFlowId?: string;
  
  // Reply target settings
  replyTo: 'all' | 'equal' | 'contain';
  equalComments?: string[];
  containComments?: string[];
  
  // Post tracking settings
  trackComments: 'all' | 'specific';
  specificPostId?: string;
  
  // Platform specific settings
  platform: 'facebook' | 'instagram';
  isActive?: boolean;
}

export interface CommentAutomationResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Facebook Comment Automation API
export const facebookCommentAPI = {
  // Save comment automation settings
  saveSettings: async (settings: Omit<CommentAutomationSettings, 'platform'>): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${FacebookCommentEndpoints.SAVE_COMMENT_SETTINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...settings,
          platform: 'facebook'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save Facebook comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get comment automation settings
  getSettings: async (): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${FacebookCommentEndpoints.GET_COMMENT_SETTINGS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get Facebook comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Update comment automation settings
  updateSettings: async (settings: Omit<CommentAutomationSettings, 'platform'>): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${FacebookCommentEndpoints.UPDATE_COMMENT_SETTINGS}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...settings,
          platform: 'facebook'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update Facebook comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Delete comment automation settings
  deleteSettings: async (): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${FacebookCommentEndpoints.DELETE_COMMENT_SETTINGS}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete Facebook comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get analytics
  getAnalytics: async (): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${FacebookCommentEndpoints.GET_COMMENT_ANALYTICS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get Facebook comment analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Instagram Comment Automation API
export const instagramCommentAPI = {
  // Save comment automation settings
  saveSettings: async (settings: Omit<CommentAutomationSettings, 'platform'>): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${InstagramCommentEndpoints.SAVE_COMMENT_SETTINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...settings,
          platform: 'instagram'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save Instagram comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get comment automation settings
  getSettings: async (): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${InstagramCommentEndpoints.GET_COMMENT_SETTINGS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get Instagram comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Update comment automation settings
  updateSettings: async (settings: Omit<CommentAutomationSettings, 'platform'>): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${InstagramCommentEndpoints.UPDATE_COMMENT_SETTINGS}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...settings,
          platform: 'instagram'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update Instagram comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Delete comment automation settings
  deleteSettings: async (): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${InstagramCommentEndpoints.DELETE_COMMENT_SETTINGS}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete Instagram comment settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get analytics
  getAnalytics: async (): Promise<CommentAutomationResponse> => {
    try {
      const response = await fetch(`${baseUrl}${InstagramCommentEndpoints.GET_COMMENT_ANALYTICS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get Instagram comment analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
