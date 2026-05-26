import { useAuthContext } from "./useAuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useLogout = () => {
    const { logout: logoutContext } = useAuthContext();

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (_error) {
            console.error('Logout request failed');
        } finally {
            logoutContext();
        }
    };

    return { logout };
};