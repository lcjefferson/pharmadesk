import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Layout from '../components/Layout';

import Dashboard from '../pages/Dashboard/Dashboard';
import Clients from '../pages/Clients/Clients';
import Agenda from '../pages/Agenda/Agenda';
import Leads from '../pages/Leads/Leads';
import Service from '../pages/Service/Service';
import Campaigns from '../pages/Campaigns/Campaigns';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';
import Users from '../pages/Users/Users';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="agenda" element={<Agenda />} />
                            <Route path="leads" element={<Leads />} />
                            <Route path="service" element={<Service />} />
                            <Route path="campaigns" element={<Campaigns />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="users" element={<Users />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
