import React from 'react';
import { useAuth } from '../auth/useAuth.ts';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireWrite?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireWrite = false
}) => {
    const { isAuthenticated, hasWriteAccess, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg
                        className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <p className="text-gray-600">Laden...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Nicht angemeldet
                    </h2>
                    <p className="text-gray-600">
                        Sie werden zur Anmeldeseite weitergeleitet...
                    </p>
                </div>
            </div>
        );
    }

    if (requireWrite && !hasWriteAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Keine Berechtigung
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Sie benötigen Schreibzugriff, um auf diese Seite zugreifen zu können.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                            Ihre aktuelle Rolle: <span className="font-semibold">Lesen</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Kontaktieren Sie einen Administrator, um Ihre Berechtigungen zu erweitern
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;