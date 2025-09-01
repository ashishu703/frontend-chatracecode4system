import serverHandler from '../enpointsUtils/serverHandler';
import { WhatsAppEndpoints } from '../enpointsUtils/Api-endpoints';
import { TempleteItem } from '@/types/broadcast/broadCastResponse';
import { GenericApiResponse } from '@/types/api/common';

export interface WhatsAppTemplateButton {
    id: string;
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
}

export interface WhatsAppTemplateComponent {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    example?: {
        header_handle?: string[];
        header_text?: string[];
        body_text?: string[][];
    };
    buttons?: MetaApiButton[];
}

export interface MetaApiButton {
    type: string;
    text: string;
    url?: string;
    phone?: string;
}

export interface WhatsAppTemplateData {
    name: string;
    language: string;
    category: string;
    components: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateResponse {
    success: boolean;
    msg: string;
    response: any;
}

export const whatsappTemplatesAPI = {
    addMetaTemplate: async (templateData: WhatsAppTemplateData, options?: { abortKey?: string }): Promise<WhatsAppTemplateResponse> => {
        try {
            const response = await serverHandler.post<WhatsAppTemplateResponse>(WhatsAppEndpoints.ADD_META_TEMPLATE, templateData, {
                abortKey: options?.abortKey
            });
            return response.data || {
                success: false,
                msg: 'Unexpected error Occured',
                response: null
            };
        } catch (error: any) {
            if (error.message === 'Request cancelled') {
                throw error;
            }
            
            const errorMsg = error.response?.data?.msg ||
                error.response?.data?.message ||
                error.message ||
                'Failed to add template';

            return {
                success: false,
                msg: errorMsg,
                response: null
            };
        }
    },

    getMyMetaTemplates: async (): Promise<GenericApiResponse<TempleteItem[]>> => {
        try {
            const response = await serverHandler.get<GenericApiResponse<TempleteItem[]>>(WhatsAppEndpoints.GET_MY_META_TEMPLATES);
            return response.data;   
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to fetch templates', data: [] };
        }
    },

    deleteMetaTemplate: async (templateName: string): Promise<any> => {
        try {
            const response = await serverHandler.post(WhatsAppEndpoints.DELETE_META_TEMPLATE, { name: templateName });
            return response.data;
        } catch (error: any) {
            return { success: false, msg: 'Failed to delete template' };
        }
    }
};

const convertButtonsToMetaFormat = (buttons: WhatsAppTemplateButton[]): MetaApiButton[] => {
    if (!buttons || buttons.length === 0) return [];

    return buttons.map(button => {
        switch (button.type) {
            case 'Visit website':
                return {
                    type: 'URL',
                    text: button.text.trim(),
                    url: button.url || ''
                };
            case 'Call on WhatsApp':
            case 'Call phone number':
                return {
                    type: 'PHONE_NUMBER',
                    text: button.text.trim(),
                    phone_number: button.phone_number ? (button.phone_number.startsWith('+91') ? button.phone_number : '+91' + button.phone_number) : ''
                };
            case 'Copy offer code':
                return {
                    type: 'COPY_CODE',
                    text: button.text.trim(),
                    example: button.url || 'OFFER_CODE'
                };
            case 'Complete Flow':
            case 'Custom':
            default:
                return { type: 'QUICK_REPLY', text: button.text.trim() };
        }
    });
};

export const buildMetaTemplateBody = (
    templateName: string,
    language: string,
    category: string,
    broadcastType: string,
    headerText: string,
    headerUrl: string,
    bodyText: string,
    footerText: string,
    buttons: WhatsAppTemplateButton[],
    headerVariables: string[] = [],
    bodyVariables: string[] = []
): WhatsAppTemplateData => {
    const components: WhatsAppTemplateComponent[] = [];

    if (broadcastType === "Text" && headerText?.trim()) {
        const headerVariablesFromText = extractVariables(headerText);

        components.push({
            type: 'HEADER',
            format: 'TEXT',
            text: headerText.trim(),
            example: headerVariablesFromText.length > 0 ? {
                header_text: headerVariables.slice(0, headerVariablesFromText.length)
            } : undefined
        });
    } else if (broadcastType !== "Text" && broadcastType !== "None" && headerUrl?.trim()) {
        const format = broadcastType === "Image" ? 'IMAGE' :
            broadcastType === "Video" ? 'VIDEO' : 'DOCUMENT';

        components.push({
            type: 'HEADER',
            format,
            example: {
                header_handle: [headerUrl.trim()]
            }
        });
    }

    if (bodyText?.trim()) {
        const bodyVariablesFromText = extractVariables(bodyText);

        components.push({
            type: 'BODY',
            text: bodyText.trim(),
            example: bodyVariablesFromText.length > 0 ? {
                body_text: [bodyVariables.slice(0, bodyVariablesFromText.length)]
            } : undefined
        });
    }

    if (footerText?.trim()) {
        components.push({ type: 'FOOTER', text: footerText.trim() });
    }

    if (buttons?.length > 0) {
        const metaButtons = convertButtonsToMetaFormat(buttons);
        if (metaButtons.length > 0) {
            components.push({ type: 'BUTTONS', buttons: metaButtons });
        }
    }

    return {
        name: templateName.trim(),
        language: language.trim(),
        category: category.trim().toUpperCase(),
        components
    };
};

const extractVariables = (text: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
        variables.push(match[1]);
    }

    return variables;
};


