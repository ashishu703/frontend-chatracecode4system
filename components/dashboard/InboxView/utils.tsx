import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookMessenger, faWhatsapp, faInstagram, faTelegram } from "@fortawesome/free-brands-svg-icons"

export const formatTime = (timestamp: string | Date | number) => {
  if (!timestamp) return ""
  try {
    let date: Date
    if (typeof timestamp === "number") {
      date = new Date(timestamp * 1000)
    } else if (typeof timestamp === "string") {
      const numTimestamp = parseInt(timestamp)
      if (!isNaN(numTimestamp) && numTimestamp > 1000000000) {
        date = new Date(numTimestamp * 1000)
      } else {
        date = new Date(timestamp)
      }
    } else {
      date = timestamp
    }
    if (isNaN(date.getTime())) {
      return ""
    }
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch (error) {
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
      return <FontAwesomeIcon icon={faFacebookMessenger} style={{ color: "#0084FF", fontSize: 18 }} />
    case "telegram":
      return <FontAwesomeIcon icon={faTelegram} style={{ color: "#229ED9", fontSize: 18 }} />
    default:
      return <FontAwesomeIcon icon={faFacebookMessenger} style={{ color: "#ccc", fontSize: 18 }} />
  }
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


