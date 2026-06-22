import { useAuthContext } from './useAuthContext';
import { useLogout } from './useLogout';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('API_BASE_URL:', API_BASE_URL);

export const useApiFetch = () => {
    const { accessToken, login } = useAuthContext();
    const { logout } = useLogout();

    const apiFetch = async (endpoint, options = {}) => {
        const makeRequest = async (token) => {
            return fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            });
        };

        let response = await makeRequest(accessToken);

        if (response.status !== 401 && response.status !== 403) {
            return response;
        }

        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!refreshResponse.ok) {
            await logout();
            return null;
        }

        const data = await refreshResponse.json();

        login({
            user: data.user,
            accessToken: data.accessToken,
        });

        response = await makeRequest(data.accessToken);

        if (response.status === 401 || response.status === 403) {
            await logout();
            return null;
        }

        return response;
    };

    return { apiFetch };
};