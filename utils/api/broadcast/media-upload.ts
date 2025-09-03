import serverHandler from "../enpointsUtils/serverHandler";
import { UserEndpoints } from "../enpointsUtils/Api-endpoints";


export interface MediaUploadData {
    file: File;
    templet_name: string;
}

export interface MediaUploadResponse {
    success: boolean;
    url?: string;
    hash?: string;
    msg?: string;
    error?: string;
}

export const mediaUploadAPI = {
    uploadMediaToMeta: async (file: File, templateName: string, options?: { abortKey?: string }): Promise<MediaUploadResponse> => {
        try {
            const formData = new FormData();
            console.log("file",file);
            formData.append('file', file);
            formData.append('templet_name', templateName);

            const response = await serverHandler.post<MediaUploadResponse>(UserEndpoints.UPLOAD_MEDIA_META, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                abortKey: options?.abortKey
            });
            return response.data || {
                success: false,
                error: 'Upload failed'
            };

        } catch (error: any) {
            if (error.message === 'Request cancelled') {
                throw error;
            }
            
            const errorMsg = error.response?.data?.msg ||
                error.response?.data?.message ||
                error.message ||
                'Upload failed';

            return {
                success: false,
                error: errorMsg
            };
        }
    }
};
