import serverHandler from "@/utils/serverHandler"
import type { BroadcastResponse } from "@/types/broadcast/broadcast"

export const fetchBroadcasts = async (params: {
  page?: number
  limit?: number
  search?: string
  status?: string[]
  dateRange?: { from: Date; to: Date }
}): Promise<BroadcastResponse> => {
  try {
    const queryParams: any = {
      page: params.page !== undefined ? params.page : 0,
      limit: params.limit || 10
    }
    
    if (params.search) queryParams.search = params.search
    if (params.status?.length) queryParams.status = params.status.join(',')
    if (params.dateRange?.from) queryParams.from = params.dateRange.from.toISOString()
    if (params.dateRange?.to) queryParams.to = params.dateRange.to.toISOString()
    
    const response = await serverHandler.get('/api/broadcast/get_broadcast', { 
      params: queryParams 
    })
    
    return response.data as BroadcastResponse
  } catch (error) {
    console.error('Error fetching broadcasts:', error)
    throw error
  }
}
