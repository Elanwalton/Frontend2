import axios from 'axios';
import { getApiUrl } from './apiUrl';

const axiosClient = axios.create({
    withCredentials: true,
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Attempt to refresh the token
                await axios.post(getApiUrl('/auth/refresh'), {}, { withCredentials: true });
                
                // If successful, retry the original request
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or notify
                console.error('Session expired, please login again.');
                if (typeof window !== 'undefined') {
                    // Save current path to redirect back after login
                    const currentPath = window.location.pathname;
                    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=expired`;
                }
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;
