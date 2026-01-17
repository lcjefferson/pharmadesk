import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../UI/Icons';
import { Logo } from '../UI/Logo';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const allItems = [
        { name: 'Dashboard', href: '/', icon: Icons.Home },
        { name: 'Empresas', href: '/companies', icon: Icons.Briefcase, superadminOnly: true },
        { name: 'Clientes', href: '/clients', icon: Icons.Users },
        { name: 'Agenda', href: '/agenda', icon: Icons.Calendar },
        { name: 'Leads', href: '/leads', icon: Icons.UserPlus },
        { name: 'Atendimento', href: '/service', icon: Icons.Chat },
        { name: 'Campanhas', href: '/campaigns', icon: Icons.Megaphone },
        { name: 'Relatórios', href: '/reports', icon: Icons.Chart },
        { name: 'Usuários', href: '/users', icon: Icons.Users },
        { name: 'Configurações', href: '/settings', icon: Icons.Cog },
    ];

    const operatorAllowed = ['/clients', '/leads', '/agenda', '/service'];
    
    let items = allItems;

    if (user?.role === 'operator') {
        items = allItems.filter(i => operatorAllowed.includes(i.href));
    } else if (user?.role !== 'superadmin') {
        // Hide superadmin only items for non-superadmins
        items = allItems.filter(i => !i.superadminOnly);
    } else {
        // Superadmin sees everything (or maybe filter out some things? For now, everything)
        // Ensure "Empresas" is visible
    }

    // Assuming isCollapsed is defined elsewhere or passed as a prop,
    // for this example, let's assume it's a prop or state variable.
    // If not defined, the code will break. For the purpose of this edit,
    // I'll assume it's available.
    const isCollapsed = false; // Placeholder, adjust as per actual component logic

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar Panel */}
            <div className={`fixed inset-y-0 left-0 bg-slate-900 text-white w-64 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col h-full shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className={`p-4 font-bold text-xl flex items-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center justify-center w-full">
                            <Logo className="h-28 w-auto text-white" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shrink-0">
                            <Icons.Sparkles className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {items.map(i => (
                        <Link
                            key={i.name}
                            to={i.href}
                            onClick={() => onClose && onClose()}
                            className={`flex items-center px-4 py-3 rounded-md transition-colors ${location.pathname === i.href ? 'bg-slate-800 text-primary-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            <i.icon className="h-6 w-6 mr-3" />
                            {i.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button onClick={logout} className="flex items-center text-slate-400 hover:text-white w-full">
                        <Icons.Logout className="w-5 h-5 mr-2" />
                        Sair
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
