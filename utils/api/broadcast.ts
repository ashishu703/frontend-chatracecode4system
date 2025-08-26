import serverHandler from '../serverHandler';

export const broadcastAPI = {
    getBroadcasts: async () => {
        try {
            const response = await serverHandler.get('/api/broadcast/get_broadcast');
            return response.data;
        } catch (error: any) {
            return { success: false, msg: 'Failed to get broadcasts' };
        }
    }
};
