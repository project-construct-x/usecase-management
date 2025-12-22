import { Routes, Route, NavLink } from "react-router-dom";
import UseCaseList from "./pages/UseCaseList";
import UseCaseDetail from "./pages/UseCaseDetail";
import RoleList from "./pages/RoleList.tsx";
import RoleDetail from "./pages/RoleDetail.tsx";
import SubUseCaseList from "./pages/SubUseCaseList.tsx";
import SubUseCaseDetail from "./pages/SubUseCaseDetail.tsx";
import TransactionList from "./pages/TransactionList.tsx";
import TransactionDetail from "./pages/TransactionDetail.tsx";
import PropertyList from "./pages/PropertyList.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";

export default function App() {
    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">

            {/* Sidebar */}
            <nav className="w-56 bg-white border-r border-gray-200 p-6 space-y-4">
                <h1 className="text-xl font-semibold mb-4">Navigation</h1>

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
            </nav>

            {/* Main Area */}
            <main className="flex-1 p-8">
                <Routes>
                    <Route path="/usecases" element={<UseCaseList />} />
                    <Route path="/usecases/:id" element={<UseCaseDetail />} />
                    <Route path="/subusecases" element={<SubUseCaseList />} />
                    <Route path="/subusecases/:id" element={<SubUseCaseDetail />} />
                    <Route path="/roles" element={<RoleList />} />
                    <Route path="/roles/:id" element={<RoleDetail />} />
                    <Route path="/transactions" element={<TransactionList />} />
                    <Route path="/transactions/:id" element={<TransactionDetail />} />
                    <Route path="/properties" element={<PropertyList />} />
                    <Route path="/properties/:uuid" element={<PropertyDetail />} />
                </Routes>
            </main>
        </div>
    );
}
