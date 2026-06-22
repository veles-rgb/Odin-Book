import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthContext();

    const loginUser = async (username, password) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            login({
                user: data.user,
                accessToken: data.accessToken,
            });
        } catch (_error) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const guestLogin = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/guest-login`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            login({
                user: data.user,
                accessToken: data.accessToken,
            });
        } catch (_error) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        loginUser,
        guestLogin,
        isLoading,
        error,
    };
};