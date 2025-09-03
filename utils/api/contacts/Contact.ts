import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { UserEndpoints } from "@/utils/api/enpointsUtils/Api-endpoints";
import { AddContactPayload, AddPhonebookPayload, DeleteContactsPayload, ContactModel, Phonebook } from "@/types/contact/contactModel";
import { GenericApiResponse } from "@/types/api/common";

export const Contact = {

  getContacts: async (): Promise<GenericApiResponse<ContactModel[]>> => {
    const res = await serverHandler.get(UserEndpoints.GET_UID_CONTACTS);
    const data = res.data as GenericApiResponse<ContactModel[]>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to fetch contacts");
    }
    return data;
  },

  // Get all phonebooks with pagination
  getPhonebooks: async (page: number = 1, pageSize: number = 10): Promise<GenericApiResponse<Phonebook[]>> => {
    const res = await serverHandler.get(`${UserEndpoints.GET_PHONEBOOKS}?page=${page}&size=${pageSize}`);
    const data = res.data as GenericApiResponse<Phonebook[]>;
    console.log(data);
    if (!data.success) {
      throw new Error((data as any).message || "Failed to fetch phonebooks");
    }
    return data;
  },

  addContact: async (payload: AddContactPayload): Promise<GenericApiResponse<ContactModel>> => {
    const res = await serverHandler.post(UserEndpoints.ADD_SINGLE_CONTACT, payload);
    const data = res.data as GenericApiResponse<ContactModel>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to add contact");
    }
    return data;
  },

  addPhonebook: async (payload: AddPhonebookPayload): Promise<GenericApiResponse<Phonebook>> => {
    const res = await serverHandler.post(UserEndpoints.ADD_PHONEBOOK, payload);
    const data = res.data as GenericApiResponse<Phonebook>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to add phonebook");
    }
    return data;
  },

  deleteContacts: async (payload: DeleteContactsPayload): Promise<GenericApiResponse<{ deleted: number }>> => {
    const res = await serverHandler.post(UserEndpoints.DELETE_CONTACTS, payload);
    const data = res.data as GenericApiResponse<{ deleted: number }>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to delete contacts");
    }
    return data;
  },

  importContacts: async (formData: FormData): Promise<GenericApiResponse<{ imported: number }>> => {
    const res = await serverHandler.post(UserEndpoints.IMPORT_CONTACTS, formData);
    const data = res.data as GenericApiResponse<{ imported: number }>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to import contacts");
    }
    return data;
  },

  reassignContactsToPhonebook: async (contactIds: number[], newPhonebookId: number): Promise<GenericApiResponse<{
    updatedContacts: number;
    newPhonebookId: number;
    newPhonebookName: string;
  }>> => {
    const res = await serverHandler.post(UserEndpoints.REASSIGN_CONTACTS, {
      contactIds,
      newPhonebookId
    });
    const data = res.data as GenericApiResponse<{
      updatedContacts: number;
      newPhonebookId: number;
      newPhonebookName: string;
    }>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to reassign contacts");
    }
    return data;
  },

  getUserInfo: async (): Promise<GenericApiResponse<{ id: string; phonebook_id: string; phonebook_name: string }>> => {
    const res = await serverHandler.get(UserEndpoints.GET_PROFILE);
    const data = res.data as GenericApiResponse<{ id: string; phonebook_id: string; phonebook_name: string }>;
    if (!data.success) {
      throw new Error((data as any).message || "Failed to fetch user info");
    }
    return data;
  },
};
