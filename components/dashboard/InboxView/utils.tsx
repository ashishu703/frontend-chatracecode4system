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


