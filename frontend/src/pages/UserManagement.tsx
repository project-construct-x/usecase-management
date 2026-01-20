// src/pages/UserManagement.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../auth/useAuth.ts';
import type { User, UserCreate, RoleEnum } from '../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const {hasWriteAccess, user: currentUser} = useAuth();

    // Formular-State
    const [formData, setFormData] = useState<UserCreate>({
        email: '',
        username: '',
        password: '',
        role: 'read'
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError('');
            const data = await api.listUsers();
            setUsers(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Fehler beim Laden der Benutzer');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            await api.register(formData);
            await fetchUsers();
            setShowCreateForm(false);
            setFormData({
                email: '',
                username: '',
                password: '',
                role: 'read'
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Fehler beim Erstellen des Benutzers');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRole = async (userId: number, newRole: RoleEnum) => {
        try {
            await api.updateUser(userId, {role: newRole});
            await fetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Fehler beim Aktualisieren der Rolle');
            }
        }
    };

    const handleToggleActive = async (userId: number, isActive: boolean) => {
        try {
            await api.updateUser(userId, {is_active: !isActive});
            await fetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Fehler beim Aktualisieren des Status');
            }
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (userId === currentUser?.id) {
            alert('Sie können sich nicht selbst löschen');
            return;
        }

        if (!window.confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        try {
            await api.deleteUser(userId);
            await fetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Fehler beim Löschen des Benutzers');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
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
                    <p className="text-gray-600">Lade Benutzer...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Benutzerverwaltung
                </h1>
                <p className="text-gray-600">
                    Verwalten Sie Benutzerkonten und Berechtigungen
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {hasWriteAccess && (
                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {showCreateForm ? 'Abbrechen' : '+ Neuer Benutzer'}
                    </button>
                </div>
            )}

            {showCreateForm && (
                <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Neuen Benutzer erstellen</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Benutzername
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-Mail
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Passwort
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={isSubmitting}
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rolle
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value as RoleEnum})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                >
                                    <option value="read">Lesen</option>
                                    <option value="write">Schreiben</option>
                                </select>
                            </div>
                        </div>

                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {formError}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormError('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={isSubmitting}
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Erstelle...' : 'Benutzer erstellen'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Benutzername
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            E-Mail
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rolle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Erstellt
                        </th>
                        {hasWriteAccess && (
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aktionen
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className={user.id === currentUser?.id ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.username}
                                        {user.id === currentUser?.id && (
                                            <span className="ml-2 text-xs text-blue-600 font-semibold">
                                                    (Sie)
                                                </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {hasWriteAccess && user.id !== currentUser?.id ? (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleUpdateRole(user.id, e.target.value as RoleEnum)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="read">Lesen</option>
                                        <option value="write">Schreiben</option>
                                    </select>
                                ) : (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'write'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                            {user.role === 'write' ? 'Schreiben' : 'Lesen'}
                                        </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {hasWriteAccess && user.id !== currentUser?.id ? (
                                    <button
                                        onClick={() => handleToggleActive(user.id, user.is_active)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {user.is_active ? 'Aktiv' : 'Inaktiv'}
                                    </button>
                                ) : (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                            {user.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.created_at).toLocaleDateString('de-DE')}
                            </td>
                            {hasWriteAccess && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {user.id !== currentUser?.id && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Löschen
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Keine Benutzer gefunden
                </div>
            )}
        </div>
    );
};

export default UserManagement