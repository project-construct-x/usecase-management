import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../auth/useAuth.ts';
import type { User, UserCreate, RoleEnum } from '../types';
import { Users, Plus, Trash2, Shield, ShieldOff } from 'lucide-react';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { hasWriteAccess, user: currentUser } = useAuth();

    const [formData, setFormData] = useState<UserCreate>({
        email: '',
        username: '',
        password: '',
        role: 'read',
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
            setError(err instanceof Error ? err.message : 'Fehler beim Laden der Benutzer');
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
            setFormData({ email: '', username: '', password: '', role: 'read' });
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Benutzers');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRole = async (userId: number, newRole: RoleEnum) => {
        try {
            await api.updateUser(userId, { role: newRole });
            await fetchUsers();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Rolle');
        }
    };

    const handleToggleActive = async (userId: number, isActive: boolean) => {
        try {
            await api.updateUser(userId, { is_active: !isActive });
            await fetchUsers();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Status');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (userId === currentUser?.id) {
            alert('Sie können sich nicht selbst löschen');
            return;
        }
        if (!window.confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
        try {
            await api.deleteUser(userId);
            await fetchUsers();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Benutzers');
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lade Benutzer…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-icon">
                    <Users size={20} />
                </div>
                <div>
                    <div className="page-header-title">Benutzerverwaltung</div>
                    <div className="page-header-sub">Benutzerkonten und Berechtigungen verwalten</div>
                </div>
                {hasWriteAccess && (
                    <button
                        onClick={() => { setShowCreateForm(!showCreateForm); setFormError(''); }}
                        className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ marginLeft: 'auto' }}
                    >
                        <Plus size={14} />
                        {showCreateForm ? 'Abbrechen' : 'Neuer Benutzer'}
                    </button>
                )}
            </div>

            {/* Global Error */}
            {error && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                    <svg style={{ flexShrink: 0, width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Neuen Benutzer erstellen
                        </span>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreateUser}>
                            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                                <div>
                                    <label className="form-label form-label-required">Benutzername</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="form-input"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-label-required">E-Mail</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="form-input"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-label-required">Passwort</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="form-input"
                                        required
                                        disabled={isSubmitting}
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Rolle</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleEnum })}
                                        className="form-input form-select"
                                        disabled={isSubmitting}
                                    >
                                        <option value="read">Lesen</option>
                                        <option value="write">Schreiben</option>
                                    </select>
                                </div>
                            </div>

                            {formError && (
                                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                                    {formError}
                                </div>
                            )}

                            <div className="form-actions" style={{ marginTop: 0 }}>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Erstelle…' : 'Benutzer erstellen'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    disabled={isSubmitting}
                                    onClick={() => { setShowCreateForm(false); setFormError(''); }}
                                >
                                    Abbrechen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">
                        Alle Benutzer
                    </span>
                    <span className="badge badge-gray">
                        {users.length} {users.length === 1 ? 'Eintrag' : 'Einträge'}
                    </span>
                </div>

                {users.length === 0 ? (
                    <div className="table-empty">
                        <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>Keine Benutzer gefunden</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead className="table-thead">
                            <tr>
                                <th className="table-th">Benutzername</th>
                                <th className="table-th">E-Mail</th>
                                <th className="table-th">Rolle</th>
                                <th className="table-th">Status</th>
                                <th className="table-th">Erstellt</th>
                                {hasWriteAccess && (
                                    <th className="table-th" style={{ textAlign: 'right' }}>Aktionen</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="table-tbody">
                            {users.map((user) => {
                                const isSelf = user.id === currentUser?.id;
                                return (
                                    <tr
                                        key={user.id}
                                        className="table-row"
                                        style={isSelf ? { background: 'var(--accent-subtle)' } : undefined}
                                    >
                                        <td className="table-td">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--blue-500), var(--violet-500))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {user.username.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{user.username}</span>
                                                {isSelf && (
                                                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>Sie</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="table-td" style={{ color: 'var(--text-secondary)' }}>
                                            {user.email}
                                        </td>
                                        <td className="table-td">
                                            {hasWriteAccess && !isSelf ? (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user.id, e.target.value as RoleEnum)}
                                                    className="form-input form-select"
                                                    style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '12px' }}
                                                >
                                                    <option value="read">Lesen</option>
                                                    <option value="write">Schreiben</option>
                                                </select>
                                            ) : (
                                                <span className={`badge ${user.role === 'write' ? 'badge-success' : 'badge-primary'}`}>
                                                    {user.role === 'write' ? 'Schreiben' : 'Lesen'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="table-td">
                                            {hasWriteAccess && !isSelf ? (
                                                <button
                                                    onClick={() => handleToggleActive(user.id, user.is_active)}
                                                    className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}
                                                    style={{ border: 'none', cursor: 'pointer', gap: '4px' }}
                                                    title={user.is_active ? 'Klicken zum Deaktivieren' : 'Klicken zum Aktivieren'}
                                                >
                                                    {user.is_active
                                                        ? <><Shield size={10} /> Aktiv</>
                                                        : <><ShieldOff size={10} /> Inaktiv</>
                                                    }
                                                </button>
                                            ) : (
                                                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                                                    {user.is_active ? 'Aktiv' : 'Inaktiv'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="table-td" style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                            {new Date(user.created_at).toLocaleDateString('de-DE')}
                                        </td>
                                        {hasWriteAccess && (
                                            <td className="table-td">
                                                <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="action-btn action-delete"
                                                            title="Benutzer löschen"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                <div className="table-footer">
                    {users.length} {users.length === 1 ? 'Benutzer' : 'Benutzer'} gesamt
                </div>
            </div>
        </div>
    );
};

export default UserManagement;