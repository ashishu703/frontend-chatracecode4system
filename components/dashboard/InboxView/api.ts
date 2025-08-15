import serverHandler from "@/utils/serverHandler"

const getToken = () =>
  localStorage.getItem("serviceToken") || localStorage.getItem("adminToken") || ""

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:6400"

export const fetchChats = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/inbox/get_chats?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    )
    const data = await response.json()
    return data?.data || []
  } catch (error) {
    return []
  }
}

export const fetchMessagesForChat = async (chatId: string, page: number = 1, limit: number = 20) => {
  try {
    console.log("🔍 fetchMessagesForChat called with chatId:", chatId, "page:", page, "limit:", limit)
    console.log("🔍 Using baseUrl:", baseUrl)
    console.log("🔍 Using token:", getToken().substring(0, 20) + "...")

    const response = await fetch(`${baseUrl}/api/inbox/get_convo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ 
        chatId: chatId.toString(),
        page: page,
        limit: limit
      }),
    })

    console.log("🔍 Response status:", response.status)
    console.log("🔍 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error("❌ HTTP error! status:", response.status)
      const errorText = await response.text()
      console.error("❌ Error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("🔍 Response data:", data)

    if (data.success && data.data) {
      console.log("✅ Success! Returning", data.data.length, "messages")
      return data.data
    }
    console.log("⚠️ No success or no data in response")
    return []
  } catch (error) {
    console.error("❌ fetchMessagesForChat error:", error)
    return []
  }
}

export const listMessengerChats = async () => {
  const chatsResponse: any = await serverHandler.get("/api/messanger/list-chats", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  })
  return chatsResponse?.data
}

export const sendMessage = async (text: string, chatId: string, _senderId?: string) => {
  console.log("🚀 sendMessage API called with:", { text, chatId, _senderId })
  console.log("🚀 baseUrl:", baseUrl)
  console.log("🚀 token:", getToken().substring(0, 20) + "...")
  
  // Backend expects: text, chatId, senderId
  const payload = { 
    text: text, 
    chatId: chatId, 
    senderId: _senderId || "default" // Use default if no senderId provided
  }
  console.log("🚀 Sending payload:", payload)
  
  const response = await fetch(`${baseUrl}/api/messanger/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  })
  
  console.log("🚀 API response status:", response.status)
  console.log("🚀 API response ok:", response.ok)
  
  return response
}

export const sendFile = async (file: File, chatId: string, senderId: string) => {
  try {
    const fileInfo = `📎 File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    const response = await fetch(`${baseUrl}/api/messanger/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        text: fileInfo,
        chatId: chatId,
        senderId: senderId,
      }),
    })
    if (!response.ok) {
      return false
    }
    const result = await response.json()
    return result.success || false
  } catch (error) {
    return false
  }
}

export const tokenUtils = { getToken }

// Upload a media file and return a public URL
export const uploadMedia = async (file: File): Promise<string | false> => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch(`${baseUrl}/api/user/return_media_url`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    })
    if (!response.ok) return false
    const data = await response.json()
    if (data?.success && data?.url) return data.url as string
    return false
  } catch {
    return false
  }
}

// Send media message (image | video | audio | file) via backend messenger send API
export const sendMedia = async (
  params: { type: "image" | "video" | "audio" | "file"; url: string; caption?: string; chatId: string; senderId: string }
): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}/api/messanger/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        text: params.caption || params.url, // Use caption or URL as text
        chatId: params.chatId,
        senderId: params.senderId,
        type: params.type,
        url: params.url,
      }),
    })
    if (!response.ok) return false
    const result = await response.json()
    return !!result?.success
  } catch (e) {
    return false
  }
}


