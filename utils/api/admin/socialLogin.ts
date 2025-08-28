import serverHandler from "@/utils/serverHandler"
import { 
  GoogleLoginSettings, 
  MetaPlatformsSettings, 
  SocialLoginResponse,
} from "./types"
import { AdminEndpoints } from "../Api-endpoints";

export const socialLoginApi = {

  // Google Login API
  updateGoogleLogin: async (googleSettings: GoogleLoginSettings): Promise<SocialLoginResponse> => {
    try {
      const response = await serverHandler.post<SocialLoginResponse>(AdminEndpoints.UPDATE_SOCIAL_LOGIN, googleSettings)
      return response.data
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to update Google login")
    }
  },

  // Meta Platforms API (Facebook, Instagram, WhatsApp)
  updateMetaPlatforms: async (metaSettings: MetaPlatformsSettings | FormData): Promise<SocialLoginResponse> => {
    try {
      const response = await serverHandler.post<SocialLoginResponse>(AdminEndpoints.UPDATE_META_PLATFORMS, metaSettings)
      return response.data
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to update Meta platforms")
    }
  },

  // Get all social login settings
  getSocialLoginSettings: async (): Promise<SocialLoginResponse> => {
    try {
      const response = await serverHandler.get<SocialLoginResponse>(AdminEndpoints.GET_SOCIAL_LOGIN_DETAILS)
      return response.data
    } catch (error: any) {
      throw new Error(error?.response?.data?.msg || error.message || "Failed to fetch social login settings")
    }
  }
};
