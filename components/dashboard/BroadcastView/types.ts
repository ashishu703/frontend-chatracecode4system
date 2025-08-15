 export interface TemplateButton {
   id: string
   type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE"
   text: string
   url?: string
   phoneNumber?: string
   copyCode?: string
 }

 export interface Template {
   id: string
   name: string
   category: string
   language: string
   status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
   lastUpdated: string
   header?: {
     type: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT"
     text?: string
     mediaUrl?: string
   }
   body: string
   footer?: string
   buttons: TemplateButton[]
   variables: string[]
   catalogEnabled: boolean
   catalogId?: string
 }


