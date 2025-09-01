import { Message } from './../../components/dashboard/InboxView/types';
// Common API Response Types - Reusable across the project

/**
 * Generic API Response Structure
 * Use this type for any API response that follows the standard structure:
 * { success: boolean, data: T, pagination?: PaginationInfo }
 */
export interface GenericApiResponse<T> {
  success: boolean
  data: T
  pagination?: PaginationInfo
  message?: string
}

/**
 * Standard Pagination Information
 * Use this for any API response that includes pagination
 */
export interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

/**
 * Common Error Response
 * Standard error structure from APIs
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  code?: string
}
