import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth/useAuth.ts";
import { useTheme } from "./components/ThemeProvider.tsx";
import Login from "./pages/Login.tsx";
import { Moon, Sun } from "lucide-react";

function AppContent() {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="app-container">
            {/* Sidebar */}
            <nav className="app-sidebar">
                {/* User Info & Theme Toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold">Navigation</h1>
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user?.username}
                        </div>
                        <div className="text-xs mt-1">
                            Rolle: {user?.role === 'write' ? 'Schreiben' : 'Lesen'}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full btn btn-danger text-sm"
                    >
                        Abmelden
                    </button>
                </div>

                <div className="divider my-4"></div>

                {/* Main Navigation */}
                <NavLink
                    to="/usecases"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Use Cases
                </NavLink>

                <NavLink
                    to="/subusecases"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Sub Use Cases
                </NavLink>

                <NavLink
                    to="/roles"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Rollen
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Transaktionen
                </NavLink>

                <NavLink
                    to="/classes"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Klassen
                </NavLink>

                <NavLink
                    to="/propertygroups"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Merkmalsgruppen
                </NavLink>

                <NavLink
                    to="/properties"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Merkmale
                </NavLink>

                <NavLink
                    to="/ontologies"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Ontologien
                </NavLink>

                <NavLink
                    to="/standards"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Standards
                </NavLink>

                {/* Admin Section */}
                <div className="divider my-4"></div>

                <div className="nav-section-title">
                    VERWALTUNG
                </div>

                <NavLink
                    to="/users"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    Benutzer
                </NavLink>

                <NavLink
                    to="/api-keys"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                    }
                >
                    API-Keys
                </NavLink>
            </nav>

            {/* Main Area */}
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AppContent;