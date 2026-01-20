import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth.ts';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [useApiKey, setUseApiKey] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithApiKey } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (useApiKey) {
                if (!apiKey.trim()) {
                    throw new Error('Bitte geben Sie einen API-Key ein');
                }
                await loginWithApiKey(apiKey);
            } else {
                if (!username.trim() || !password.trim()) {
                    throw new Error('Bitte geben Sie Benutzername und Passwort ein');
                }
                await login(username, password);
            }
        } catch (err: any) {
            setError(err.message || 'Anmeldung fehlgeschlagen');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAuthMethod = () => {
        setUseApiKey(!useApiKey);
        setError('');
        setUsername('');
        setPassword('');
        setApiKey('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Willkommen
                    </h1>
                    <p className="text-gray-600">
                        Melden Sie sich an, um fortzufahren
                    </p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-center space-x-4 bg-gray-100 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => !useApiKey || toggleAuthMethod()}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                !useApiKey
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Passwort
                        </button>
                        <button
                            type="button"
                            onClick={() => useApiKey || toggleAuthMethod()}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                useApiKey
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            API-Key
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!useApiKey ? (
                        <>
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Benutzername
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Ihr Benutzername"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Passwort
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Ihr Passwort"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label
                                htmlFor="apiKey"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                API-Key
                            </label>
                            <input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm"
                                placeholder="Fügen Sie Ihren API-Key ein"
                                required
                                disabled={isLoading}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Der API-Key wird Ihnen von einem Administrator bereitgestellt
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <svg
                                className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                Wird angemeldet...
                            </span>
                        ) : (
                            'Anmelden'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Haben Sie noch keinen Account?{' '}
                        <span className="text-gray-400">
                            Kontaktieren Sie Ihren Administrator
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;