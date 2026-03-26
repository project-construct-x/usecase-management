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
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-app)',
                padding: '24px',
            }}
        >
            <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">

                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--green-600), var(--blue-500))',
                            marginBottom: '16px',
                            boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                        }}
                    >
                        <Database size={26} color="white" />
                    </div>
                    <h1
                        style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                            marginBottom: '4px',
                        }}
                    >
                        Willkommen zurück
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Melden Sie sich an, um fortzufahren
                    </p>
                </div>

                {/* Card */}
                <div className="card">
                    <div className="card-body">

                        {/* Auth Method Toggle */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '4px',
                                background: 'var(--bg-subtle)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '4px',
                                marginBottom: '24px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => useApiKey && toggleAuthMethod()}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '7px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-sans)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: !useApiKey ? 'var(--bg-card)' : 'transparent',
                                    color: !useApiKey ? 'var(--accent-text)' : 'var(--text-muted)',
                                    boxShadow: !useApiKey ? 'var(--shadow-xs)' : 'none',
                                }}
                            >
                                <Lock size={13} />
                                Passwort
                            </button>
                            <button
                                type="button"
                                onClick={() => !useApiKey && toggleAuthMethod()}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '7px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-sans)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: useApiKey ? 'var(--bg-card)' : 'transparent',
                                    color: useApiKey ? 'var(--accent-text)' : 'var(--text-muted)',
                                    boxShadow: useApiKey ? 'var(--shadow-xs)' : 'none',
                                }}
                            >
                                <Key size={13} />
                                API-Key
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {!useApiKey ? (
                                <>
                                    <div>
                                        <label htmlFor="username" className="form-label">
                                            Benutzername
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    left: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    pointerEvents: 'none',
                                                }}
                                            >
                                                <User size={15} />
                                            </span>
                                            <input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="form-input"
                                                style={{ paddingLeft: '36px' }}
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
                                        <div style={{ position: 'relative' }}>
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    left: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    pointerEvents: 'none',
                                                }}
                                            >
                                                <Lock size={15} />
                                            </span>
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-input"
                                                style={{ paddingLeft: '36px' }}
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
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-muted)',
                                                display: 'flex',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <Key size={15} />
                                        </span>
                                        <input
                                            id="apiKey"
                                            type="text"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="form-input"
                                            style={{ paddingLeft: '36px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                                            placeholder="Fügen Sie Ihren API-Key ein"
                                            required
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="form-hint" style={{ marginTop: '6px' }}>
                                        Der API-Key wird Ihnen von einem Administrator bereitgestellt
                                    </p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="alert alert-error animate-fade-in">
                                    <svg className="w-5 h-5" style={{ flexShrink: 0, width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: '4px' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} style={{ animation: 'spin 0.75s linear infinite' }} />
                                        Wird angemeldet…
                                    </>
                                ) : (
                                    <>
                                        <Lock size={15} />
                                        Anmelden
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p
                    style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                    }}
                >
                    Noch kein Account?{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Kontaktieren Sie Ihren Administrator
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;