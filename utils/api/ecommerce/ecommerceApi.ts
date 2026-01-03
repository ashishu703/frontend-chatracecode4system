import serverHandler from "@/utils/api/enpointsUtils/serverHandler"

class EcommerceApi {
  private basePath = "/api/ecommerce"

  async getOverview() {
    try {
      const response = await serverHandler.get(`${this.basePath}/overview`)
      return (response.data as any).data || { connectedCatalogs: 0 }
    } catch (error) {
      console.error("Error fetching overview:", error)
      return { connectedCatalogs: 0 }
    }
  }

  async getCatalogs() {
    try {
      const response = await serverHandler.get(`${this.basePath}/catalogs`)
      return (response.data as any).data || []
    } catch (error) {
      console.error("Error fetching catalogs:", error)
      return []
    }
  }

  async createCatalog(data: any) {
    try {
      const response = await serverHandler.post(`${this.basePath}/catalogs`, data)
      return (response.data as any).data
    } catch (error) {
      console.error("Error creating catalog:", error)
      throw error
    }
  }

  async deleteCatalog(id: string) {
    try {
      const response = await serverHandler.delete(`${this.basePath}/catalogs/${id}`)
      return (response.data as any).data
    } catch (error) {
      console.error("Error deleting catalog:", error)
      throw error
    }
  }

  async syncProducts(catalogId: string) {
    try {
      const response = await serverHandler.post(`${this.basePath}/catalogs/${catalogId}/sync-products`)
      return (response.data as any).data
    } catch (error) {
      console.error("Error syncing products:", error)
      throw error
    }
  }

  async deleteCatalog(id: string) {
    try {
      const response = await serverHandler.delete(`${this.basePath}/catalogs/${id}`)
      return (response.data as any).data
    } catch (error) {
      console.error("Error deleting catalog:", error)
      throw error
    }
  }

  async getProducts(catalogId?: string) {
    try {
      const url = catalogId ? `${this.basePath}/products?catalogId=${catalogId}` : `${this.basePath}/products`
      const response = await serverHandler.get(url)
      return (response.data as any).data || []
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  }

  async createProduct(catalogId: string, data: any) {
    try {
      const response = await serverHandler.post(`${this.basePath}/products`, { ...data, catalogId })
      return (response.data as any).data
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  async updateProduct(catalogId: string, productId: string, data: any) {
    try {
      const response = await serverHandler.put(`${this.basePath}/products/${catalogId}/${productId}`, data)
      return (response.data as any).data
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  async deleteProduct(catalogId: string, productId: string) {
    try {
      const response = await serverHandler.delete(`${this.basePath}/products/${catalogId}/${productId}`)
      return (response.data as any).data
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  async getOrders(filters?: { status?: string; page?: number; limit?: number }) {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.page) params.append("page", filters.page.toString())
      if (filters?.limit) params.append("limit", filters.limit.toString())
      
      const url = params.toString() ? `${this.basePath}/orders?${params}` : `${this.basePath}/orders`
      const response = await serverHandler.get(url)
      return (response.data as any).data || { orders: [], total: 0 }
    } catch (error) {
      console.error("Error fetching orders:", error)
      return { orders: [], total: 0 }
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await serverHandler.put(`${this.basePath}/orders/${orderId}/status`, { status })
      return (response.data as any).data
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  async getPaymentConfigurations() {
    try {
      const response = await serverHandler.get(`${this.basePath}/payments/configurations`)
      return (response.data as any).data || []
    } catch (error) {
      console.error("Error fetching payment configurations:", error)
      return []
    }
  }

  async createPaymentConfiguration(data: any) {
    try {
      const response = await serverHandler.post(`${this.basePath}/payments/configurations`, data)
      return (response.data as any).data
    } catch (error) {
      console.error("Error creating payment configuration:", error)
      throw error
    }
  }

  async updatePaymentConfiguration(id: string, data: any) {
    try {
      const response = await serverHandler.put(`${this.basePath}/payments/configurations/${id}`, data)
      return (response.data as any).data
    } catch (error) {
      console.error("Error updating payment configuration:", error)
      throw error
    }
  }

  async deletePaymentConfiguration(id: string) {
    try {
      const response = await serverHandler.delete(`${this.basePath}/payments/configurations/${id}`)
      return (response.data as any).data
    } catch (error) {
      console.error("Error deleting payment configuration:", error)
      throw error
    }
  }

  async getCommerceSettings() {
    try {
      const response = await serverHandler.get(`${this.basePath}/settings/commerce`)
      return (response.data as any).data || {}
    } catch (error) {
      console.error("Error fetching commerce settings:", error)
      return {}
    }
  }

  async updateCommerceSettings(settings: any) {
    try {
      const response = await serverHandler.put(`${this.basePath}/settings/commerce`, settings)
      return (response.data as any).data
    } catch (error) {
      console.error("Error updating commerce settings:", error)
      throw error
    }
  }

  async getOrderSettings() {
    try {
      const response = await serverHandler.get(`${this.basePath}/settings/order`)
      return (response.data as any).data || {}
    } catch (error) {
      console.error("Error fetching order settings:", error)
      return {}
    }
  }

  async updateOrderSettings(settings: any) {
    try {
      const response = await serverHandler.put(`${this.basePath}/settings/order`, settings)
      return (response.data as any).data
    } catch (error) {
      console.error("Error updating order settings:", error)
      throw error
    }
  }
}

export const ecommerceApi = new EcommerceApi()
