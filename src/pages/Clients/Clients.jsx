import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import { Icons } from '../../components/UI/Icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [operators, setOperators] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        try {
            const response = await api.get('/users');
            const onlyOperators = response.data.filter(
                (u) => u.role === 'operator' && u.isActive !== false
            );
            setOperators(onlyOperators);
        } catch (error) {
            console.error('Erro ao carregar operadores:', error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchOperators();
    }, []);

    if (loading) return <div>Carregando...</div>;

    const canAssign = user && (user.role === 'sdr' || user.role === 'admin' || user.role === 'supervisor');

    const activeClients = clients.filter(c =>
        c.status === 'active' &&
        (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSaveClient = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const name = String(fd.get('name') || '').trim();
        const email = String(fd.get('email') || '').trim();
        const phone = String(fd.get('phone') || '').trim();
        const rawTags = String(fd.get('tags') || '').trim();

        if (!name || !phone) {
            addToast('Nome e telefone são obrigatórios.', 'error');
            return;
        }

        if (email && !/\S+@\S+\.\S+/.test(email)) {
            addToast('Informe um email válido.', 'error');
            return;
        }

        const clientData = {
            name,
            email,
            phone,
            tags: rawTags ? rawTags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            status: 'active'
        };

        try {
            if (editingClient) {
                await api.patch(`/clients/${editingClient.id}`, clientData);
            } else {
                await api.post('/clients', clientData);
            }
            fetchClients();
            setIsModalOpen(false);
            setEditingClient(null);
            addToast(
                editingClient ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!',
                'success'
            );
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            addToast('Erro ao salvar cliente. Verifique os dados.', 'error');
        }
    };

    const handleAssignClient = async (clientId, userId) => {
        try {
            setClients((prev) =>
                prev.map((c) =>
                    c.id === clientId ? { ...c, assignedToId: userId || null } : c
                )
            );
            await api.patch(`/clients/${clientId}/assign`, { userId: userId || null });
        } catch (error) {
            console.error('Erro ao atribuir cliente:', error);
            fetchClients();
        }
    };

    const openNewClientModal = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const openEditClientModal = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between gap-4">
                <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente ativo..."
                    className="flex-1 max-w-md border p-2 rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <button
                    onClick={openNewClientModal}
                    className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Icons.Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 text-left">Nome</th>
                            <th className="px-6 py-3 text-left">Telefone</th>
                            <th className="px-6 py-3 text-left">Responsável</th>
                            <th className="px-6 py-3 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {activeClients.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 dark:text-white">
                                    <div>{c.name}</div>
                                    <div className="text-sm text-slate-500">{c.email}</div>
                                </td>
                                <td className="px-6 py-4 dark:text-slate-300">{c.phone}</td>
                                <td className="px-6 py-4 dark:text-slate-300">
                                    {canAssign ? (
                                        <select
                                            className="border rounded p-1 bg-transparent text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={c.assignedToId || ''}
                                            onChange={(e) => handleAssignClient(c.id, e.target.value)}
                                        >
                                            <option value="">Não atribuído</option>
                                            {operators.map((op) => (
                                                <option key={op.id} value={op.id}>
                                                    {op.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm">
                                            {operators.find((op) => op.id === c.assignedToId)?.name || 'Não atribuído'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => navigate('/service', { state: { client: c } })}
                                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center gap-1 text-xs px-3"
                                    >
                                        <Icons.Chat className="w-4 h-4" />
                                        Omnichannel
                                    </button>
                                    <button
                                        onClick={() => openEditClientModal(c)}
                                        className="bg-slate-500 text-white p-2 rounded hover:bg-slate-600 flex items-center gap-1 text-xs px-3"
                                    >
                                        <Icons.Pencil className="w-4 h-4" />
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}>
                <form onSubmit={handleSaveClient} className="space-y-4">
                    <input required name="name" defaultValue={editingClient?.name} placeholder="Nome" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <input required name="phone" defaultValue={editingClient?.phone} placeholder="Telefone" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <input name="email" defaultValue={editingClient?.email} placeholder="Email" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <input name="tags" defaultValue={editingClient?.tags?.join(',')} placeholder="Tags (separadas por vírgula)" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <div className="flex justify-end">
                        <button className="bg-primary-600 text-white px-4 py-2 rounded">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clients;
