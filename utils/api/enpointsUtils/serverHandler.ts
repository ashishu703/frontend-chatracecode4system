import axios from 'axios';

// Enhanced serverHandler with AbortController support
class EnhancedServerHandler {
  private axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4500',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private controllers = new Map<string, AbortController>();

  constructor() {
    // Client-side interceptor (only runs in browser)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.axiosInstance.interceptors.request.use((config) => {
        // Try serviceToken first, then adminToken
        const token = localStorage.getItem('serviceToken') || localStorage.getItem('adminToken');
        if (token) {
          if (!config.headers) config.headers = {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      });
    }
  }

  // Enhanced POST method with AbortController support
  async post<T = any>(url: string, data?: any, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      // Abort existing request if it exists
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.post<T>(url, data, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    // Default behavior without abort control
    return this.axiosInstance.post<T>(url, data, axiosConfig);
  }

  // Enhanced GET method with AbortController support
  async get<T = any>(url: string, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.get<T>(url, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.get<T>(url, axiosConfig);
  }

  // Enhanced PUT method with AbortController support
  async put<T = any>(url: string, data?: any, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.put<T>(url, data, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.put<T>(url, data, axiosConfig);
  }

  // Enhanced DELETE method with AbortController support
  async delete<T = any>(url: string, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.delete<T>(url, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.delete<T>(url, axiosConfig);
  }

  // Manual abort methods
  abort(abortKey: string) {
    const controller = this.controllers.get(abortKey);
    if (controller) {
      controller.abort();
      this.controllers.delete(abortKey);
    }
  }

  abortAll() {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }

  isActive(abortKey: string): boolean {
    return this.controllers.has(abortKey);
  }

  // Get the underlying axios instance for advanced usage
  get axios() {
    return this.axiosInstance;
  }
}

const serverHandler = new EnhancedServerHandler();

export default serverHandler; 