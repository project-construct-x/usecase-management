import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth.ts';
import { Database, Lock, User, Key, Loader2 } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-300/20 dark:bg-primary-700/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-300/20 dark:bg-accent-700/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo Card */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 shadow-2xl shadow-primary-500/30 mb-4">
                        <Database className="text-white" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        Willkommen zurück
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Melden Sie sich an, um fortzufahren
                    </p>
                </div>

                {/* Login Card */}
                <div className="card animate-scale-in">
                    <div className="card-body">
                        {/* Auth Method Toggle */}
                        <div className="mb-6">
                            <div className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => !useApiKey || toggleAuthMethod()}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        !useApiKey
                                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Lock size={16} />
                                    Passwort
                                </button>
                                <button
                                    type="button"
                                    onClick={() => useApiKey || toggleAuthMethod()}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        useApiKey
                                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Key size={16} />
                                    API-Key
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!useApiKey ? (
                                <>
                                    <div>
                                        <label htmlFor="username" className="form-label">
                                            Benutzername
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                                <User size={18} />
                                            </div>
                                            <input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="form-input pl-11"
                                                placeholder="Ihr Benutzername"
                                                required
                                                disabled={isLoading}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="form-label">
                                            Passwort
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-input pl-11"
                                                placeholder="Ihr Passwort"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label htmlFor="apiKey" className="form-label">
                                        API-Key
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            id="apiKey"
                                            type="text"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="form-input pl-11 font-mono text-sm"
                                            placeholder="Fügen Sie Ihren API-Key ein"
                                            required
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="form-hint mt-2">
                                        Der API-Key wird Ihnen von einem Administrator bereitgestellt
                                    </p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-error animate-fade-in">
                                    <svg
                                        className="w-5 h-5 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn btn-primary btn-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Wird angemeldet...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Anmelden
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
                    <p>
                        Haben Sie noch keinen Account?{' '}
                        <span className="text-gray-500 dark:text-gray-500">
                            Kontaktieren Sie Ihren Administrator
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;