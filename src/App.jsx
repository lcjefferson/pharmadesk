import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Clients/Clients';
import Leads from './pages/Leads/Leads';
import Service from './pages/Service/Service';
import Campaigns from './pages/Campaigns/Campaigns';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Users from './pages/Users/Users';
import Agenda from './pages/Agenda/Agenda';
import Companies from './pages/SuperAdmin/Companies';

import './index.css';

const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
};

const ForbidOperator = ({ children }) => {
    const { user } = useAuth();
    if (user?.role === 'operator') {
        return <Navigate to="/clients" replace />;
    }
    return children;
};

const RequireSuperAdmin = ({ children }) => {
    const { user } = useAuth();
    if (user?.role !== 'superadmin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/"
                                element={
                                    <RequireAuth>
                                        <Layout />
                                    </RequireAuth>
                                }
                            >
                                <Route index element={<ForbidOperator><Dashboard /></ForbidOperator>} />
                                <Route path="clients" element={<Clients />} />
                                <Route path="leads" element={<Leads />} />
                                <Route path="agenda" element={<Agenda />} />
                                <Route path="service" element={<Service />} />
                                <Route
                                    path="campaigns"
                                    element={
                                        <ForbidOperator>
                                            <Campaigns />
                                        </ForbidOperator>
                                    }
                                />
                                <Route
                                    path="reports"
                                    element={
                                        <ForbidOperator>
                                            <Reports />
                                        </ForbidOperator>
                                    }
                                />
                                <Route
                                    path="settings"
                                    element={
                                        <ForbidOperator>
                                            <Settings />
                                        </ForbidOperator>
                                    }
                                />
                                <Route
                                    path="users"
                                    element={
                                        <ForbidOperator>
                                            <Users />
                                        </ForbidOperator>
                                    }
                                />
                                <Route
                                    path="companies"
                                    element={
                                        <RequireSuperAdmin>
                                            <Companies />
                                        </RequireSuperAdmin>
                                    }
                                />
                            </Route>
                        </Routes>
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </HashRouter>
    );
}

export default App;
