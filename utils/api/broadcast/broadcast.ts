import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import { BroadcastEndpoints } from "../enpointsUtils/Api-endpoints"
import type { GenericApiResponse } from "@/types/api/common"
import { PhonebookItems } from "@/types/broadcast/phonebook"
import { BroadcastResponse } from "@/types/broadcast/broadCastResponse"

export const Broadcast = {
  fetchBroadcasts: async (params: {
    page?: number
    limit?: number
    search?: string
    status?: string[]
    dateRange?: { from: Date; to: Date }
  }): Promise<GenericApiResponse<BroadcastResponse[]>> => {
    try {
      const queryParams: any = {
        page: params.page !== undefined ? params.page : 0,
        limit: params.limit || 10
      }

      if (params.search) queryParams.search = params.search
      if (params.status?.length) queryParams.status = params.status.join(',')
      if (params.dateRange?.from) queryParams.from = params.dateRange.from.toISOString()
      if (params.dateRange?.to) queryParams.to = params.dateRange.to.toISOString()

      const response = await serverHandler.get(BroadcastEndpoints.GET_ALL_BROADCASTS_HISTORY, {
        params: queryParams
      })

      return response.data as GenericApiResponse<BroadcastResponse[]>
    } catch (error) {
      console.error('Error fetching broadcasts:', error)
      throw error
    }
  },

  fetchPhonebooksByUid: async (): Promise<GenericApiResponse<PhonebookItems[]>> => {
    try {
      const response = await serverHandler.get(BroadcastEndpoints.GET_PHONEBOOKS_BY_UID_FOR_BROADCAST)
      return response.data as GenericApiResponse<PhonebookItems[]>
    } catch (error) {
      console.error('Error fetching phonebooks:', error)
      throw error
    }
  },

  addNewBroadcast: async (payload: {
    title: string
    templet: {
      name: string
      parameter_format: string
      components: Array<{
        type: string
        text: string
      }>
      language: string
      status: string
      category: string
      id: string
    }
    phonebook: {
      id: number
      name: string
      uid: string
      createdAt: string
      updatedAt: string
    }
    scheduleTimestamp?: number
    example: any[]
  }): Promise<GenericApiResponse<any>> => {
    try {
      const response = await serverHandler.post(BroadcastEndpoints.ADD_NEW_BROADCAST, payload)
      return response.data as GenericApiResponse<any>
    } catch (error) {
      console.error('Error creating broadcast:', error)
      throw error
    }
  }
}
