import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth/useAuth.ts";
import Login from "./pages/Login.tsx";

function AppContent() {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            {/* Sidebar */}
            <nav className="w-56 bg-white border-r border-gray-200 p-6 space-y-4">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold mb-2">Navigation</h1>
                    <div className="text-sm text-gray-600 mb-4">
                        <div>{user?.username}</div>
                        <div className="text-xs">
                            Rolle: {user?.role === 'write' ? 'Schreiben' : 'Lesen'}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Abmelden
                    </button>
                </div>

                <NavLink
                    to="/usecases"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Use Cases
                </NavLink>

                <NavLink
                    to="/subusecases"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Sub Use Cases
                </NavLink>

                <NavLink
                    to="/roles"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Rollen
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Transaktionen
                </NavLink>

                <NavLink
                    to="/propertygroups"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Merkmalsgruppen
                </NavLink>

                <NavLink
                    to="/properties"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Merkmale
                </NavLink>

                <NavLink
                    to="/ontologies"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Ontologien
                </NavLink>

                <NavLink
                    to="/standards"
                    className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                    }
                >
                    Standards
                </NavLink>

                {/* Admin-Bereich */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                        VERWALTUNG
                    </div>

                    <NavLink
                        to="/users"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm font-medium
                            ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                        }
                    >
                        Benutzer
                    </NavLink>

                    <NavLink
                        to="/api-keys"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm font-medium
                            ${isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`
                        }
                    >
                        API-Keys
                    </NavLink>
                </div>
            </nav>

            {/* Main Area */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default AppContent;