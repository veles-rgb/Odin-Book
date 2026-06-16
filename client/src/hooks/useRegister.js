import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useRegister = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthContext();

    const registerUser = async (firstName, lastName, username, password, profile_picture_url, profile_picture_public_id) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    password,
                    profile_picture_url,
                    profile_picture_public_id,
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

        } catch (error) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return { registerUser, isLoading, error };
};