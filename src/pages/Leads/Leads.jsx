import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import { Icons } from '../../components/UI/Icons';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const KANBAN_COLUMNS = [
    { id: 'new', title: 'Novos', color: 'bg-blue-100 border-blue-200 text-blue-800' },
    { id: 'contacted', title: 'Contatados', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' },
    { id: 'qualified', title: 'Qualificados', color: 'bg-purple-100 border-purple-200 text-purple-800' },
    { id: 'converted', title: 'Convertidos', color: 'bg-green-100 border-green-200 text-green-800' },
    { id: 'lost', title: 'Perdidos', color: 'bg-red-100 border-red-200 text-red-800' }
];

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [operators, setOperators] = useState([]);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useAuth();

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            addToast('Erro ao carregar leads.', 'error');
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
        fetchLeads();
        fetchOperators();
    }, []);

    const canAssign = user && (user.role === 'sdr' || user.role === 'admin' || user.role === 'supervisor');

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            
            await api.patch(`/leads/${leadId}`, { status: newStatus });
            addToast('Status atualizado!');
            
            // Se converteu, pergunta se quer criar cliente
            if (newStatus === 'converted') {
                const lead = leads.find(l => l.id === leadId);
                if (lead && confirm('Deseja criar um Cliente a partir deste Lead agora?')) {
                    handleConvertLead(lead);
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            addToast('Erro ao atualizar status.', 'error');
            fetchLeads(); // Revert on error
        }
    };

    const handleAssignLead = async (leadId, userId) => {
        try {
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === leadId ? { ...l, assignedToId: userId || null } : l
                )
            );
            await api.patch(`/leads/${leadId}/assign`, { userId: userId || null });
            addToast('Lead atribuído com sucesso!');
        } catch (error) {
            console.error('Erro ao atribuir lead:', error);
            addToast('Erro ao atribuir lead.', 'error');
            fetchLeads();
        }
    };

    const handleSaveLead = async (e) => {
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

        const leadData = {
            name,
            email,
            phone,
            tags: rawTags ? rawTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            status: editingLead ? editingLead.status : 'new'
        };

        try {
            if (editingLead) {
                await api.patch(`/leads/${editingLead.id}`, leadData);
                addToast('Lead atualizado com sucesso!');
            } else {
                await api.post('/leads', leadData);
                addToast('Lead criado com sucesso!');
            }
            setIsModalOpen(false);
            setEditingLead(null);
            fetchLeads();
        } catch (error) {
            console.error("Erro ao salvar lead:", error);
            addToast('Erro ao salvar lead.', 'error');
        }
    };

    const openEditLeadModal = (lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const simulateCapture = async () => {
        setIsCapturing(true);
        const newLead = {
            name: 'Lead Simulado ' + Date.now().toString().slice(-4),
            email: `lead${Date.now()}@teste.com`,
            phone: '11900000000',
            tags: ['novo_lead'],
            status: 'new',
            source: 'simulation'
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const res = await api.post('/leads', newLead);
            addToast('Lead capturado com sucesso!');
            setLeads(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Erro ao capturar lead:", error);
            addToast('Erro ao capturar lead.', 'error');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleConvertLead = async (lead) => {
        try {
            const clientData = {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                type: 'individual',
                document: '00000000000', 
                address: 'Endereço a preencher',
                status: 'active'
            };
            await api.post('/clients', clientData);
            addToast('Cliente criado com sucesso!');
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            addToast('Erro ao criar cliente.', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando quadro de leads...</div>;

    return (
        <div className="space-y-6 fade-in h-[calc(100vh-120px)] flex flex-col">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Icons.Users className="w-6 h-6 text-blue-600" />
                        Pipeline de Leads
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seus leads visualmente.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                    >
                        <Icons.Plus className="w-4 h-4" /> Novo Lead
                    </button>
                    <button
                        onClick={simulateCapture}
                        disabled={isCapturing}
                        className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-4 py-2 rounded flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                    >
                        {isCapturing ? 'Capturando...' : 'Simular Entrada'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-4 min-w-[1200px] pb-4">
                    {KANBAN_COLUMNS.map(column => (
                        <div key={column.id} className="flex-1 min-w-[280px] flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className={`p-3 border-b border-slate-200 dark:border-slate-700 font-semibold flex justify-between items-center ${column.color} bg-opacity-20 rounded-t-lg`}>
                                <span>{column.title}</span>
                                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                                    {leads.filter(l => l.status === column.id).length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {leads
                                    .filter(l => l.status === column.id)
                                    .map(lead => (
                                        <div key={lead.id} className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-slate-900 dark:text-white truncate" title={lead.name}>{lead.name}</h3>
                                                <button onClick={() => openEditLeadModal(lead)} className="text-slate-400 hover:text-blue-500">
                                                    <Icons.Pencil className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-xs text-slate-500 space-y-1 mb-3">
                                                {lead.email && <div className="flex items-center gap-1"><Icons.Mail className="w-3 h-3" /> {lead.email}</div>}
                                                {lead.phone && <div className="flex items-center gap-1"><Icons.Phone className="w-3 h-3" /> {lead.phone}</div>}
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {lead.tags?.map((tag, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className="text-xs text-slate-500">Responsável:</span>
                                                {canAssign ? (
                                                    <select
                                                        className="text-xs border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5 bg-transparent dark:text-white max-w-[140px]"
                                                        value={lead.assignedToId || ''}
                                                        onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                                                    >
                                                        <option value="">Não atribuído</option>
                                                        {operators.map((op) => (
                                                            <option key={op.id} value={op.id}>
                                                                {op.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs text-slate-700 dark:text-slate-300">
                                                        {operators.find((op) => op.id === lead.assignedToId)?.name || 'Não atribuído'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center mt-auto">
                                                <button
                                                    onClick={() => navigate('/service', { state: { client: lead } })}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Icons.Chat className="w-3 h-3" /> Chat
                                                </button>

                                                <select
                                                    className="text-xs border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5 bg-transparent dark:text-white max-w-[100px]"
                                                    value={lead.status}
                                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                >
                                                    {KANBAN_COLUMNS.map(opt => (
                                                        <option key={opt.id} value={opt.id}>{opt.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLead ? 'Editar Lead' : 'Novo Lead'}>
                <form onSubmit={handleSaveLead} className="space-y-4">
                    <input required name="name" defaultValue={editingLead?.name} placeholder="Nome" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <input required name="phone" defaultValue={editingLead?.phone} placeholder="Telefone" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <input type="email" name="email" defaultValue={editingLead?.email} placeholder="Email" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <input name="tags" defaultValue={editingLead?.tags?.join(',')} placeholder="Tags (separadas por vírgula)" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    <div className="flex justify-end">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Leads;
