

export interface SocialLoginResponse<T = any> {
  success: boolean
  msg: string
  data: T
}

export interface GoogleLoginSettings {
  google_client_id: string
  google_login_active: number
}

export interface MetaPlatformsSettings {
  // Meta platform fields
  fb_login_app_id: string
  fb_login_app_sec: string
  fb_login_active: number
  facebook_client_id: string
  facebook_client_secret: string
  facebook_graph_version: string
  facebook_auth_scopes: string
  meta_webhook_verification_key: string
  instagram_client_id: string
  instagram_client_secret: string
  instagram_graph_version: string
  instagram_auth_scopes: string
  whatsapp_client_id: string
  whatsapp_client_secret: string
  whatsapp_graph_version: string
  whatsapp_config_id: string
  
  // App configuration fields
  id: number
  currency_code: string
  logo: string
  app_name: string
  custom_home: string
  is_custom_home: number
  meta_description: string
  currency_symbol: string
  chatbot_screen_tutorial: string
  broadcast_screen_tutorial: string
  home_page_tutorial: string
  login_header_footer: number
  exchange_rate: string
  rtl: number
}



// Get Web Public Response Type (matches your actual API response)
export interface GetWebPublicResponse {
  id: number
  currency_code: string
  logo: string
  app_name: string
  custom_home: string
  is_custom_home: number
  meta_description: string
  currency_symbol: string
  chatbot_screen_tutorial: string
  broadcast_screen_tutorial: string
  home_page_tutorial: string
  login_header_footer: number
  exchange_rate: string
  google_client_id: string
  google_login_active: number
  rtl: number
  fb_login_app_id: string | null
  fb_login_app_sec: string | null
  fb_login_active: number
  facebook_client_id: string
  facebook_client_secret: string
  facebook_graph_version: string
  facebook_auth_scopes: string
  meta_webhook_verification_key: string
  instagram_client_id: string
  instagram_client_secret: string
  instagram_graph_version: string
  instagram_auth_scopes: string
  whatsapp_client_id: string
  whatsapp_client_secret: string
  whatsapp_graph_version: string
  whatsapp_config_id: string
  createdAt: string
  updatedAt: string
}
