import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Dashboard');

    useEffect(() => {
        const path = location.pathname;
        let title = 'Dashboard';

        if (path === '/') title = 'Dashboard';
        else if (path.startsWith('/clients')) title = 'Clientes';
        else if (path.startsWith('/leads')) title = 'Leads';
        else if (path.startsWith('/agenda')) title = 'Agenda';
        else if (path.startsWith('/service')) title = 'Atendimentos';
        else if (path.startsWith('/campaigns')) title = 'Campanhas';
        else if (path.startsWith('/reports')) title = 'Relatórios';
        else if (path.startsWith('/settings')) title = 'Configurações';
        else if (path.startsWith('/users')) title = 'Usuários';

        setPageTitle(title);
        document.title = `${title} - PharmaDesk`;
    }, [location]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 sm:pb-6 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
