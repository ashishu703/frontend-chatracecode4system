export interface BroadcastResponse {
    id: number
    broadcast_id: string
    uid: string
    title: string
    templet: TempleteItem
    phonebook_id: number
    status: string
    schedule: string
    timezone: string
    createdAt: string
    updatedAt: string
    phonebook: PhonebookItem
  }
  
  export interface TempleteItem {
    name: string
    parameter_format: string
    components: TemplateComponentItems[]
    language: string
    status: string
    category: string
    id: string
    lastUpdated:string
  }
  
  export interface TemplateComponentItems {
    type: string
    text: string
    phone_number?: string
    url?: string
  }
  
  export interface PhonebookItem {
    id: number
    name: string
    uid: string
    createdAt: string
    updatedAt: string
  }
  