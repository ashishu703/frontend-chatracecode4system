import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { ChatbotEndpoints } from "@/utils/api/enpointsUtils/Api-endpoints";

export class ChatbotService {
    // Get chatbots with pagination, search, and sorting
    static async GET_CHATBOTS(params: {
        page: number;
        size: number;
        search: string;
        sort: string;
        order: string;
    }) {
        try {
            const queryParams = new URLSearchParams({
                page: params.page.toString(),
                size: params.size.toString(),
                search: params.search,
                sort: params.sort,
                order: params.order,
            });

            const response = await serverHandler.get(
                `${ChatbotEndpoints.GET_CHATBOTS}?${queryParams}`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Add new chatbot
    static async ADD_CHATBOT(payload: {
        title: string;
        flow_id: number;
        for_all: boolean;
        chats: string[];
        status: number;
    }) {
        try {
            const response = await serverHandler.post(
                ChatbotEndpoints.ADD_CHATBOT,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update existing chatbot
    static async UPDATE_CHATBOT(payload: {
        id: number;
        title: string;
        flow_id: number;
        for_all: boolean;
        chats: string[];
        status: number;
    }) {
        try {
            const response = await serverHandler.post(
                ChatbotEndpoints.UPDATE_CHATBOT,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Delete chatbot
    static async DELETE_CHATBOT(id: number) {
        try {
            const response = await serverHandler.post(ChatbotEndpoints.DELETE_CHATBOT, {
                id: id.toString(),
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change chatbot status
    static async CHANGE_BOT_STATUS(payload: {
        id: string;
        status: number;
    }) {
        try {
            const response = await serverHandler.post(
                ChatbotEndpoints.CHANGE_BOT_STATUS,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}
