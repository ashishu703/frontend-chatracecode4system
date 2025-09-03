// API Endpoints Configuration - Class-based organization

export class UserEndpoints {
  // Authentication
  static readonly LOGIN = '/api/user/login';
  static readonly REGISTER = '/api/user/register';
  static readonly LOGOUT = '/api/user/logout';
  static readonly GET_PROFILE = '/api/user/profile';
  static readonly UPDATE_PROFILE = '/api/user/profile';
  
  // Media Upload
  static readonly UPLOAD_MEDIA_META = '/api/user/return_media_url_meta';
  
  // Social Accounts
  static readonly GET_CONNECTED_ACCOUNTS = '/api/user/get_connected_accounts';
  static readonly STORE_SOCIAL_DATA = '/api/user/store_social_data';
  
  // Templates
  static readonly GET_TEMPLATES = '/api/user/get_templates';
  static readonly DELETE_TEMPLATE = '/api/user/delete_template';
  
  // Dashboard
  static readonly DASHBOARD = '/api/user/dashboard';
  static readonly GET_STATS = '/api/user/stats';
  
  // Settings
  static readonly GET_SETTINGS = '/api/user/settings';
  static readonly UPDATE_SETTINGS = '/api/user/settings';
  
  // Subscription & Billing
  static readonly GET_SUBSCRIPTION = '/api/user/subscription';
  static readonly GET_BILLING_HISTORY = '/api/user/billing_history';
  static readonly UPDATE_SUBSCRIPTION = '/api/user/update_subscription';
  
  // Password Management
  static readonly CHANGE_PASSWORD = '/api/user/change_password';
  
  // Notifications
  static readonly GET_NOTIFICATIONS = '/api/user/notifications';
  static readonly MARK_NOTIFICATION_READ = '/api/user/notifications/read';
  
  // Account Management
  static readonly DELETE_ACCOUNT = '/api/user/delete_account';
  static readonly EXPORT_DATA = '/api/user/export_data';

  // Phonebook
  static readonly IMPORT_CONTACTS = '/api/phonebook/import_contacts';
  static readonly DELETE_CONTACTS = '/api/phonebook/del_contacts';
  static readonly GET_UID_CONTACTS = '/api/phonebook/get_uid_contacts';
  static readonly ADD_SINGLE_CONTACT = '/api/phonebook/add_single_contact';
}

export class AdminEndpoints {
  // Authentication
  static readonly LOGIN = '/api/admin/login';
  static readonly LOGOUT = '/api/admin/logout';
  static readonly GET_PROFILE = '/api/admin/profile';
  static readonly UPDATE_PROFILE = '/api/admin/profile';
  
  // Dashboard
  static readonly DASHBOARD = '/api/admin/dashboard';
  static readonly GET_ANALYTICS = '/api/admin/analytics';
  static readonly GET_STATS = '/api/admin/stats';
  
  // User Management
  static readonly GET_USERS = '/api/admin/users';
  static readonly GET_USER_BY_ID = '/api/admin/users/:id';
  static readonly UPDATE_USER = '/api/admin/users/:id';
  static readonly DELETE_USER = '/api/admin/users/:id';
  static readonly BLOCK_USER = '/api/admin/users/:id/block';
  static readonly UNBLOCK_USER = '/api/admin/users/:id/unblock';
  
  // Agent Management
  static readonly GET_AGENTS = '/api/admin/agents';
  static readonly ADD_AGENT = '/api/admin/agents';
  static readonly UPDATE_AGENT = '/api/admin/agents/:id';
  static readonly DELETE_AGENT = '/api/admin/agents/:id';
  
  // SMTP Settings
  static readonly GET_SMTP_SETTINGS = '/api/admin/get_smtp_settings';
  static readonly UPDATE_SMTP = '/api/admin/update_smtp';
  static readonly SEND_TEST_EMAIL = '/api/admin/send_test_email';
  
  // App Configuration
  static readonly GET_APP_CONFIG = '/api/admin/app_config';
  static readonly UPDATE_APP_CONFIG = '/api/admin/app_config';
  
  // System Settings
  static readonly GET_SYSTEM_SETTINGS = '/api/admin/system_settings';
  static readonly UPDATE_SYSTEM_SETTINGS = '/api/admin/system_settings';
  
  // Plans & Subscriptions
  static readonly GET_PLANS = '/api/admin/plans';
  static readonly ADD_PLAN = '/api/admin/add_plan';
  static readonly UPDATE_PLAN = '/api/admin/plans/:id';
  static readonly DELETE_PLAN = '/api/admin/plans/:id';
  
  // Payments & Billing
  static readonly GET_PAYMENTS = '/api/admin/payments';
  static readonly GET_PAYMENT_BY_ID = '/api/admin/payments/:id';
  static readonly REFUND_PAYMENT = '/api/admin/payments/:id/refund';
  
  // Reports
  static readonly GET_USER_REPORTS = '/api/admin/reports/users';
  static readonly GET_REVENUE_REPORTS = '/api/admin/reports/revenue';
  static readonly GET_USAGE_REPORTS = '/api/admin/reports/usage';
  
  // Logs & Monitoring
  static readonly GET_SYSTEM_LOGS = '/api/admin/logs/system';
  static readonly GET_ERROR_LOGS = '/api/admin/logs/errors';
  static readonly GET_AUDIT_LOGS = '/api/admin/logs/audit';
}

export class AgentEndpoints {
  // Authentication
  static readonly LOGIN = '/api/agent/login';
  static readonly REGISTER = '/api/agent/register';
  static readonly LOGOUT = '/api/agent/logout';
  
  // Profile
  static readonly GET_ME = '/api/agent/get_me';
  static readonly UPDATE_PROFILE = '/api/agent/update_profile';
  
  // Dashboard
  static readonly DASHBOARD = '/api/agent/dashboard';
  
  // Chats & Conversations
  static readonly GET_MY_ASSIGNED_CHATS = '/api/agent/get_my_assigned_chats';
  static readonly GET_CONVERSATION = '/api/agent/get_convo';
  static readonly ASSIGN_CHAT = '/api/agent/assign_chat';
  static readonly CLOSE_CHAT = '/api/agent/close_chat';
  
  // Tasks
  static readonly GET_MY_TASKS = '/api/agent/get_my_task';
  static readonly MARK_TASK_COMPLETE = '/api/agent/mark_task_complete';
  static readonly CREATE_TASK = '/api/agent/create_task';
  static readonly UPDATE_TASK = '/api/agent/update_task';
  
  // Messages
  static readonly SEND_TEXT = '/api/agent/send_text';
  static readonly SEND_IMAGE = '/api/agent/send_image';
  static readonly SEND_VIDEO = '/api/agent/send_video';
  static readonly SEND_AUDIO = '/api/agent/send_audio';
  static readonly SEND_DOCUMENT = '/api/agent/send_doc';
  static readonly SEND_RECOVERY = '/api/agent/send_recovery';
  
  // Performance & Stats
  static readonly GET_MY_STATS = '/api/agent/stats';
  static readonly GET_PERFORMANCE = '/api/agent/performance';
}

export class WhatsAppEndpoints {
  // Templates
  static readonly ADD_META_TEMPLATE = '/api/whatsapp/add_meta_templet';
  static readonly GET_MY_META_TEMPLATES = '/api/whatsapp/get_my_meta_templets';
  static readonly DELETE_META_TEMPLATE = '/api/whatsapp/del_meta_templet';
  static readonly UPDATE_TEMPLATE = '/api/whatsapp/update_template';
  static readonly GET_TEMPLATE_STATUS = '/api/whatsapp/template_status';
  
  // Messaging
  static readonly SEND_MESSAGE = '/api/whatsapp/send_message';
  static readonly SEND_TEMPLATE = '/api/whatsapp/send_template';
  static readonly SEND_BROADCAST = '/api/whatsapp/send_broadcast';
  
  // Webhook
  static readonly WEBHOOK = '/api/whatsapp/webhook';
  static readonly VERIFY_WEBHOOK = '/api/whatsapp/verify_webhook';
  
  // Account Management
  static readonly GET_ACCOUNT_INFO = '/api/whatsapp/account_info';
  static readonly UPDATE_WEBHOOK_URL = '/api/whatsapp/update_webhook';
  
  // Media
  static readonly UPLOAD_MEDIA = '/api/whatsapp/upload_media';
  static readonly GET_MEDIA = '/api/whatsapp/media/:media_id';
  static readonly DELETE_MEDIA = '/api/whatsapp/media/:media_id';
}

export class AuthEndpoints {
  // Social Authentication
  static readonly FACEBOOK_AUTH = '/api/auth/facebook';
  static readonly WHATSAPP_AUTH = '/api/auth/whatsapp';
  static readonly META_CALLBACK = '/api/auth/meta/callback';
  static readonly FACEBOOK_CALLBACK = '/api/auth/facebook/callback';
  
  // Password Management
  static readonly MODIFY_PASSWORD = '/api/auth/modify_password';
  static readonly FORGOT_PASSWORD = '/api/auth/forgot_password';
  static readonly RESET_PASSWORD = '/api/auth/reset_password';
  
  // Token Management
  static readonly REFRESH_TOKEN = '/api/auth/refresh_token';
  static readonly VERIFY_TOKEN = '/api/auth/verify_token';
  static readonly REVOKE_TOKEN = '/api/auth/revoke_token';
}

export class ConfigEndpoints {
  // App Configuration
  static readonly GET_CONFIG = '/api/config';
  static readonly UPDATE_CONFIG = '/api/config/update';
  
  // App Settings
  static readonly GET_APP_SETTINGS = '/api/config/app_settings';
  static readonly UPDATE_APP_SETTINGS = '/api/config/app_settings';
  
  // Feature Flags
  static readonly GET_FEATURES = '/api/config/features';
  static readonly UPDATE_FEATURES = '/api/config/features';
  
  // Maintenance
  static readonly GET_MAINTENANCE_STATUS = '/api/config/maintenance';
  static readonly SET_MAINTENANCE_MODE = '/api/config/maintenance';
}

export class TemplateEndpoints {
  // Template Management
  static readonly GET_TEMPLATES = '/api/templet/get_templets';
  static readonly DELETE_TEMPLATE = '/api/templet/del_templets';
  static readonly UPDATE_TEMPLATE = '/api/templet/update';
  static readonly CREATE_TEMPLATE = '/api/templet/create';
  static readonly DUPLICATE_TEMPLATE = '/api/templet/duplicate';
  
  // Template Categories
  static readonly GET_CATEGORIES = '/api/templet/categories';
  static readonly CREATE_CATEGORY = '/api/templet/categories';
  static readonly UPDATE_CATEGORY = '/api/templet/categories/:id';
  static readonly DELETE_CATEGORY = '/api/templet/categories/:id';
}

export class ChatFlowEndpoints {
  // Flow Management
  static readonly GET_BY_FLOW_ID = '/api/chat_flow/get_by_flow_id';
  static readonly GET_MINE = '/api/chat_flow/get_mine';
  static readonly DELETE_FLOW = '/api/chat_flow/del_flow';
  static readonly UPDATE_FLOW = '/api/chat_flow/update';
  static readonly CREATE_FLOW = '/api/chat_flow/create';
  static readonly DUPLICATE_FLOW = '/api/chat_flow/duplicate';
  
  // Flow Testing
  static readonly TEST_FLOW = '/api/chat_flow/test';
  static readonly VALIDATE_FLOW = '/api/chat_flow/validate';
  
  // Flow Analytics
  static readonly GET_FLOW_ANALYTICS = '/api/chat_flow/analytics';
  static readonly GET_FLOW_PERFORMANCE = '/api/chat_flow/performance';
}

export class BroadcastEndpoints {
  static readonly GET_BROADCASTS = '/api/broadcast/get_broadcast';
}

export class FacebookCommentEndpoints {
  // Comment Automation Settings
  static readonly SAVE_COMMENT_SETTINGS = '/api/facebook/comment/save_settings';
  static readonly GET_COMMENT_SETTINGS = '/api/facebook/comment/get_settings';
  static readonly UPDATE_COMMENT_SETTINGS = '/api/facebook/comment/update_settings';
  static readonly DELETE_COMMENT_SETTINGS = '/api/facebook/comment/delete_settings';
  
  // Comment Tracking
  static readonly TRACK_COMMENTS = '/api/facebook/comment/track';
  static readonly GET_TRACKED_COMMENTS = '/api/facebook/comment/tracked';
  
  // Comment Replies
  static readonly SEND_PRIVATE_REPLY = '/api/facebook/comment/private_reply';
  static readonly SEND_PUBLIC_REPLY = '/api/facebook/comment/public_reply';
  
  // Analytics
  static readonly GET_COMMENT_ANALYTICS = '/api/facebook/comment/analytics';
  static readonly GET_REPLY_STATS = '/api/facebook/comment/reply_stats';
}

export class InstagramCommentEndpoints {
  // Comment Automation Settings
  static readonly SAVE_COMMENT_SETTINGS = '/api/instagram/comment/save_settings';
  static readonly GET_COMMENT_SETTINGS = '/api/instagram/comment/get_settings';
  static readonly UPDATE_COMMENT_SETTINGS = '/api/instagram/comment/update_settings';
  static readonly DELETE_COMMENT_SETTINGS = '/api/instagram/comment/delete_settings';
  
  // Comment Tracking
  static readonly TRACK_COMMENTS = '/api/instagram/comment/track';
  static readonly GET_TRACKED_COMMENTS = '/api/instagram/comment/tracked';
  
  // Comment Replies
  static readonly SEND_PRIVATE_REPLY = '/api/instagram/comment/private_reply';
  static readonly SEND_PUBLIC_REPLY = '/api/instagram/comment/public_reply';
  
  // Analytics
  static readonly GET_COMMENT_ANALYTICS = '/api/instagram/comment/analytics';
  static readonly GET_REPLY_STATS = '/api/instagram/comment/reply_stats';
}

// Helper functions
export class EndpointHelpers {
  /**
   * Build endpoint with parameters
   * @param endpoint - Endpoint with parameter placeholders
   * @param params - Parameters to replace
   * @returns Endpoint with parameters replaced
   */
  static buildEndpoint(endpoint: string, params: Record<string, string | number> = {}): string {
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
    return url;
  }

  /**
   * Build query string from parameters
   * @param params - Query parameters
   * @returns Query string
   */
  static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  /**
   * Build full URL with query parameters
   * @param endpoint - Base endpoint
   * @param params - Query parameters
   * @returns Full URL with query string
   */
  static buildUrl(endpoint: string, params: Record<string, any> = {}): string {
    const queryString = this.buildQueryString(params);
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }
}

// Export all classes for easy access
export const API_ENDPOINTS = {
  User: UserEndpoints,
  Admin: AdminEndpoints,
  Agent: AgentEndpoints,
  WhatsApp: WhatsAppEndpoints,
  Auth: AuthEndpoints,
  Config: ConfigEndpoints,
  Template: TemplateEndpoints,
  ChatFlow: ChatFlowEndpoints,
  Broadcast: BroadcastEndpoints,
  FacebookComment: FacebookCommentEndpoints,
  InstagramComment: InstagramCommentEndpoints,
  Helpers: EndpointHelpers,
} as const;
