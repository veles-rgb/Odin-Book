import { useAuthContext } from './useAuthContext';
import { useLogout } from './useLogout';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useApiFetch = () => {
    const { accessToken } = useAuthContext();
    const { logout } = useLogout();

    const apiFetch = async (endpoint, options = {}) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include',

            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                ...options.headers,
            },
        });

        if (response.status === 401 || response.status === 403) {
            await logout();
            return null;
        }

        return response;
    };

    return { apiFetch };
};