import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookMessenger, faWhatsapp, faInstagram, faTelegram } from "@fortawesome/free-brands-svg-icons"

export const formatTime = (timestamp: string | Date | number) => {
  if (timestamp === undefined || timestamp === null || timestamp === "") return ""
  try {
    let ms: number | null = null
    if (typeof timestamp === "number") {
      ms = timestamp > 1e12 ? timestamp : timestamp * 1000
    } else if (typeof timestamp === "string") {
      if (/^\d+$/.test(timestamp)) {
        const n = parseInt(timestamp, 10)
        ms = n > 1e12 ? n : n * 1000
      } else {
        const parsed = new Date(timestamp).getTime()
        ms = Number.isNaN(parsed) ? null : parsed
      }
    } else if (timestamp instanceof Date) {
      ms = timestamp.getTime()
    }
    if (ms === null) return ""
    const date = new Date(ms)

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date)

    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || ""
    const label = `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")}:${get("second")} (IST)`
    return label
  } catch {
    return ""
  }
}

export const getChannelIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "whatsapp":
      return <FontAwesomeIcon icon={faWhatsapp} style={{ color: "#25D366", fontSize: 18 }} />
    case "instagram":
      return <FontAwesomeIcon icon={faInstagram} style={{ color: "#E1306C", fontSize: 18 }} />
    case "facebook":
    case "messenger":
    case "messanger": // Handle the typo from backend
      return <FontAwesomeIcon icon={faFacebookMessenger} style={{ color: "#0084FF", fontSize: 18 }} />
    case "telegram":
      return <FontAwesomeIcon icon={faTelegram} style={{ color: "#229ED9", fontSize: 18 }} />
    default:
      return <FontAwesomeIcon icon={faFacebookMessenger} style={{ color: "#ccc", fontSize: 18 }} />
  }
}

export const getDefaultUserIcon = () => {
  return null // Return null to trigger initials fallback
}

// Generate initials from name (e.g., "Raj koshta" -> "RK")
export const generateInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '?'
  
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}

// Check if avatar URL is valid (not a placeholder)
export const isValidAvatar = (avatarUrl: string | null | undefined): boolean => {
  if (!avatarUrl) return false
  
  // List of placeholder/fallback URLs that should trigger initials
  const placeholderUrls = [
    "https://res.cloudinary.com/drpbrn2ax/image/upload/v1755781086/417-4172348_testimonial-user-icon-color-clipart_kvpxt6.png",
    "/placeholder.svg",
    "/default-avatar.png",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDUgMTUuNzkgNSAxOFYyMEgxOVYxOEMxOSAxNS43OSAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5QjlBMEEiLz4KPC9zdmc+Cg=="
  ]
  
  return !placeholderUrls.some(placeholder => avatarUrl.includes(placeholder) || avatarUrl === placeholder)
}

export const getPageIcon = (pageName: string, pageIcon?: string) => {
  if (!pageName) return null
  if (pageIcon) {
    return (
      <img
        src={pageIcon || "/placeholder.svg"}
        alt={pageName}
        className="w-3 h-3 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }
  return (
    <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
      {pageName.charAt(0).toUpperCase()}
    </div>
  )
}

export const emojis = ["😀", "😂", "😍", "👍", "❤️", "😢", "😮", "😡", "👏", "🔥"]


