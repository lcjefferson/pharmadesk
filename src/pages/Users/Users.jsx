import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import { Icons } from '../../components/UI/Icons';
import { useToast } from '../../context/ToastContext';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            addToast('Erro ao carregar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const userData = {
            name: fd.get('name'),
            email: fd.get('email'),
            role: fd.get('role'),
        };

        const password = fd.get('password');
        if (password && password.trim() !== '') {
            userData.password = password;
        }

        try {
            if (editingUser) {
                // Se for edição e não tiver senha, não envia o campo
                if (!userData.password) delete userData.password;
                
                const response = await api.patch(`/users/${editingUser.id}`, userData);
                setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
                addToast('Usuário atualizado com sucesso!', 'success');
            } else {
                if (!userData.password || userData.password.length < 6) {
                    addToast('Senha é obrigatória e deve ter ao menos 6 caracteres.', 'error');
                    return;
                }
                const response = await api.post('/users', userData);
                setUsers([...users, response.data]);
                addToast('Usuário criado com sucesso!', 'success');
            }
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            const msg = error.response?.data?.message || 'Erro ao salvar usuário';
            addToast(Array.isArray(msg) ? msg[0] : msg, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Remover usuário?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
                addToast('Usuário removido com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao remover usuário:', error);
                addToast('Erro ao remover usuário', 'error');
            }
        }
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Gestão de Usuários</h2>
                <button
                    onClick={openNew}
                    className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Icons.Plus className="w-5 h-5" />
                    Adicionar Usuário
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 text-left">Usuário</th>
                            <th className="px-6 py-3 text-left">Função</th>
                            <th className="px-6 py-3 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${u.name}`} 
                                        className="w-8 h-8 rounded-full" 
                                        alt="" 
                                    />
                                    <div className="dark:text-white font-medium">
                                        {u.name}
                                        <div className="text-xs text-slate-500 font-normal">{u.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-xs uppercase">
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => openEdit(u)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <Icons.Cog className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Icons.Trash className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Editar Usuário" : "Novo Usuário"}>
                <form onSubmit={handleSaveUser} className="space-y-4">
                    <input
                        required
                        name="name"
                        defaultValue={editingUser?.name}
                        placeholder="Nome Completo"
                        className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                    />
                    <input
                        required
                        type="email"
                        name="email"
                        defaultValue={editingUser?.email}
                        placeholder="Email"
                        className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={editingUser ? "Senha (deixe em branco para manter)" : "Senha"}
                        className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                    />
                    <select
                        name="role"
                        defaultValue={editingUser?.role || 'operator'}
                        className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                    >
                        <option value="operator">Operador</option>
                        <option value="sdr">SDR</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div className="flex justify-end">
                        <button className="bg-primary-600 text-white px-4 py-2 rounded">
                            Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
