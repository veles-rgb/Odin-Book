import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useAuthContext();

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const json = await response.json();

        if (!response.ok) {
            setIsLoading(false);
            setError(json.error);
        }
        if (response.ok) {
            // Save user to local storage
            localStorage.setItem('user', JSON.stringify(json));

            // Update AuthContext
            dispatch({ type: "LOGIN", payload: json });

            setIsLoading(false);
        }
    };

    return { login, isLoading, error };
};