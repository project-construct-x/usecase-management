import { useContext } from 'react';
import { AuthContext } from './AuthContext.tsx';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
    }
    return context;
};