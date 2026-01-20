import { createContext } from 'react';

import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    loginWithApiKey: (apiKey: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasWriteAccess: boolean;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

