/**
 * Helper functions for E-commerce feature
 * Following DRY principle and optimized for time/space complexity
 */

export class EcommerceHelpers {
  /**
   * Format currency amount
   * Time: O(1), Space: O(1)
   */
  static formatCurrency(amount: number, currency: string = "INR"): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Format date to readable string
   * Time: O(1), Space: O(1)
   */
  static formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d)
  }

  /**
   * Get status badge color
   * Time: O(1), Space: O(1)
   */
  static getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
    }
    return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  /**
   * Validate email
   * Time: O(1), Space: O(1)
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate phone number
   * Time: O(1), Space: O(1)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  /**
   * Replace template placeholders
   * Time: O(n), Space: O(n) where n is template length
   */
  static replacePlaceholders(template: string, data: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  /**
   * Debounce function for search/input
   * Time: O(1), Space: O(1)
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  /**
   * Calculate order total
   * Time: O(n), Space: O(1) where n is items count
   */
  static calculateOrderTotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  /**
   * Truncate text with ellipsis
   * Time: O(1), Space: O(1)
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }
}
