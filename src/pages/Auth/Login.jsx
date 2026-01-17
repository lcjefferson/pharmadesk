import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/UI/Logo';

const Login = () => {
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to="/" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !pass.trim()) {
            setError('Informe email e senha.');
            return;
        }
        if (!email.includes('@')) {
            setError('Informe um email válido.');
            return;
        }
        setLoading(true);
        const result = await login(email, pass);
        setLoading(false);
        if (!result.success) {
            setError(result.message || 'Erro ao fazer login.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Logo className="h-12 w-auto dark:invert" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Faça login para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="text-sm dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="text-sm dark:text-slate-300">Senha</label>
                        <input
                            type="password"
                            required
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 font-bold disabled:opacity-70"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
