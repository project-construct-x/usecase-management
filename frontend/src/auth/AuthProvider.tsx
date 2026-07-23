import React, { useState, useEffect, type ReactNode } from 'react';
import { api } from '../api/api';
import { AuthContext } from './AuthContext';
import type { User } from '../types';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initializeAuth = async () => {
        const token = localStorage.getItem('access_token');
        const apiKey = localStorage.getItem('api_key');

        if (token || apiKey) {
            await fetchCurrentUser();
        } else {
            setIsLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Fehler beim Laden des Benutzers:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await api.login(username, password);
            localStorage.setItem('access_token', response.access_token);
            localStorage.removeItem('api_key');
            await fetchCurrentUser();
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error('Login fehlgeschlagen');
            }
        }
    };

    const loginWithApiKey = async (apiKey: string) => {
        localStorage.setItem('api_key', apiKey);
        localStorage.removeItem('access_token');

        try {
            await fetchCurrentUser();
        } catch (err: unknown) {
            localStorage.removeItem('api_key');
            if (err instanceof Error) {
                throw new Error(err.message);
            } else {
                throw new Error('Ungültiger API-Key');
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('api_key');
        setUser(null);
    };

    const hasWriteAccess = user?.role === 'write';

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                loginWithApiKey,
                logout,
                isAuthenticated: !!user,
                hasWriteAccess,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};