import { Flow } from "@/types/chatbot/chatBotModel";

export class UtilityMethod {
    static getStatusBadge = (flow: Flow) => {
        const isActive = true;
        return {
            variant: (isActive ? "default" : "secondary") as "default" | "secondary",
            text: isActive ? "Active" : "Inactive"
        };
    };
}