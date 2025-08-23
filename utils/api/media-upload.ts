import serverHandler from '../serverHandler';
import { UserEndpoints } from './Api-endpoints';

export interface MediaUploadData {
    file: File;
    templet_name: string;
}

export interface MediaUploadResponse {
    success: boolean;
    msg?: string;
    data?: {
        url: string;
        hash: string;
    };
    error?: string;
}

export const mediaUploadAPI = {
    uploadMediaToMeta: async (file: File, templateName: string): Promise<MediaUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('templet_name', templateName);

            const response = await serverHandler.post(UserEndpoints.UPLOAD_MEDIA_META, formData);
            return response.data as MediaUploadResponse || {
                success: false,
                error: 'Upload failed'
            };

        } catch (error: any) {
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
