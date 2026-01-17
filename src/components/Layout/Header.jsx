import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../UI/Icons';

const Header = ({ title, onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-md">
                    <Icons.Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-white truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="text-slate-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    {theme === 'light' ? <Icons.Moon className="h-6 w-6" /> : <Icons.Sun className="h-6 w-6" />}
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium dark:text-white hidden sm:block">{user?.name}</span>
                    <img src={user?.avatar} className="h-8 w-8 rounded-full bg-slate-200" alt="Avatar" />
                </div>
            </div>
        </header>
    );
};

export default Header;
