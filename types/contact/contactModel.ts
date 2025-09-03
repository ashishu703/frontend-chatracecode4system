// Types for better type safety
export interface ContactModel {
    id: string;
    uid: string;
    phonebook_id: string;
    name?: string;
    mobile?: string;
    email?: string;
    gender?: string;
    source?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Phonebook {
    id: string;
    name: string;
  }
  
  export interface AddContactPayload {
    mobile: string;
    name: string;
    email: string | null;
    gender: string;
    source: string;
    id: string;
  }
  
  export interface AddPhonebookPayload {
    name: string;
  }
  
  export interface DeleteContactsPayload {
    selected: string[];
  }