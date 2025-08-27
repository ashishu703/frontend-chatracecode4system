export interface BroadcastTemplate {
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

export interface BroadcastPhonebook {
  id: number
  name: string
  uid: string
  createdAt: string
  updatedAt: string
}

export interface BroadcastItem {
  id: number
  broadcast_id: string
  uid: string
  title: string
  templet: BroadcastTemplate
  phonebook_id: number
  status: "FINISHED" | "PENDING" | "PROCESSING" | "FAILED" | "STOPPED"
  schedule: string
  timezone: string
  createdAt: string
  updatedAt: string
  phonebook: BroadcastPhonebook
}

export interface BroadcastPagination {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface BroadcastResponse {
  success: boolean
  data: BroadcastItem[]
  pagination: BroadcastPagination
}
