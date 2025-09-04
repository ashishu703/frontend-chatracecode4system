import { PaginationInfo } from "../api/common";

export interface Flow {
    id: number;
    uid: string;
    flow_id: string;
    title: string;
    prevent_list: string;
    ai_list:string;
    createdAt: string;
    updatedAt: string;
}

export interface Chatbot {
    id: number;
    uid: string;
    title: string;
    for_all: boolean;
    flow_id: number;
    active: boolean;
    flow: Flow;
    chatbotChats: string[];
    createdAt: string;
    updatedAt: string;

}

export interface FlowsResponse {
    success: boolean;
    data: Flow[];
    pagination: PaginationInfo;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const CHANNEL_OPTIONS = [
    { value: "instagram", label: "Instagram" },
    { value: "messenger", label: "Messenger" },
    { value: "whatsapp", label: "WhatsApp" },
];
