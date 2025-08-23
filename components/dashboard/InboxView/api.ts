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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    }
    return []
  } catch (error) {
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

export const sendMessage = async (
  text: string,
  chatId: string,
  _senderId?: string,
  extras?: { isChatActive?: boolean; platform?: string }
) => {
  const payload = { 
    text: text, 
    chatId: chatId, 
    senderId: _senderId || chatId, 
    isChatActive: extras?.isChatActive,
    platform: extras?.platform,
  }
  
  const response = await fetch(`${baseUrl}/api/messanger/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  })
  
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

export const sendMedia = async (
  params: { type: "image" | "video" | "audio" | "file"; url: string; caption?: string; chatId: string; senderId: string; platform?: string }
): Promise<boolean> => {
  try {
    const { type, url, caption, chatId, senderId, platform = "messenger" } = params
    
    let endpoint = ""
    let payload: any = {}
    
    if (platform === "whatsapp") {
      switch (type) {
        case "image":
          endpoint = "/api/whatsapp/send_image"
          payload = { url, senderId, chatId, caption }
          break
        case "video":
          endpoint = "/api/whatsapp/send_video"
          payload = { url, senderId, chatId, caption }
          break
        case "audio":
          endpoint = "/api/whatsapp/send_audio"
          payload = { url, senderId, chatId }
          break
        case "file":
          endpoint = "/api/whatsapp/send_document"
          payload = { url, senderId, chatId, caption }
          break
      }
    } else if (platform === "instagram") {
      switch (type) {
        case "image":
          endpoint = "/api/instagram/send_image"
          payload = { url, senderId, chatId, caption }
          break
        case "video":
          endpoint = "/api/instagram/send_video"
          payload = { url, senderId, chatId, caption }
          break
        case "audio":
          endpoint = "/api/instagram/send_audio"
          payload = { url, senderId, chatId }
          break
        case "file":
          endpoint = "/api/instagram/send_document"
          payload = { url, senderId, chatId, caption }
          break
      }
    } else {
      switch (type) {
        case "image":
          endpoint = "/api/messanger/send-image"
          payload = { url, senderId, chatId }
          break
        case "video":
          endpoint = "/api/messanger/send-video"
          payload = { url, senderId, chatId }
          break
        case "audio":
          endpoint = "/api/messanger/send-audio"
          payload = { url, senderId, chatId }
          break
        case "file":
          endpoint = "/api/messanger/send-doc"
          payload = { url, senderId, chatId }
          break
      }
    }
    
    if (!endpoint) {
      return false
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) return false
    const result = await response.json()
    return !!result?.success
  } catch (e) {
    return false
  }
}


