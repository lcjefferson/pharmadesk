import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import { Icons } from '../../components/UI/Icons';
import { useToast } from '../../context/ToastContext';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [tab, setTab] = useState('one-shot');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    // Mock Data for Automations and Audiences (kept as mocks for now per request scope focus on Campaigns functionality)
    const [automations, setAutomations] = useState([
        { id: 1, name: 'Boas vindas Lead', trigger: 'lead_created', action: 'send_whatsapp', status: 'active' }
    ]);
    const [audiences, setAudiences] = useState([
        { id: 1, name: 'Clientes VIP', count: 154, filters: 'tag:vip' }
    ]);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await api.get('/campaigns');
            setCampaigns(response.data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            addToast('Erro ao carregar campanhas', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newCampaign = {
            name: fd.get('name'),
            type: tab === 'one-shot' ? 'one-shot' : 'automation',
            status: tab === 'one-shot' ? 'running' : 'active', // Auto-start for now
            target: fd.get('target'),
            message: fd.get('message'),
            trigger: fd.get('trigger'),
        };

        if (tab === 'audiences') {
            // Mock audience creation
             setAudiences(p => [{
                id: Date.now(),
                name: fd.get('name'),
                count: 0,
                filters: fd.get('filters')
            }, ...p]);
            setIsModalOpen(false);
            return;
        }

        try {
            const response = await api.post('/campaigns', newCampaign);
            setCampaigns([response.data, ...campaigns]);
            addToast('Campanha criada com sucesso!', 'success');
            setIsModalOpen(false);
            fetchCampaigns(); // Refresh to get updated stats if immediate dispatch
        } catch (error) {
            console.error('Error creating campaign:', error);
            addToast('Erro ao criar campanha', 'error');
        }
    };

    if (isLoading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex gap-4 border-b dark:border-slate-700">
                {[{ id: 'one-shot', l: 'Campanhas Pontuais' }, { id: 'automation', l: 'Automação' }, { id: 'audiences', l: 'Públicos' }].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 border-b-2 transition-colors ${tab === t.id ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        {t.l}
                    </button>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Icons.Plus className="w-5 h-5" />
                    {tab === 'one-shot' ? 'Nova Campanha' : tab === 'automation' ? 'Nova Automação' : 'Novo Público'}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                {tab === 'one-shot' && (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Nome</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Público</th>
                                <th className="px-6 py-3 text-left">Alcance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {campaigns.filter(c => c.type === 'one-shot').map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 dark:text-white font-medium">{c.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase ${c.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 dark:text-slate-300">{c.target || 'Todos'}</td>
                                    <td className="px-6 py-4 dark:text-slate-300">{c.reach || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {tab === 'automation' && (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Nome</th>
                                <th className="px-6 py-3 text-left">Gatilho</th>
                                <th className="px-6 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                             {/* Integrating backend data for automations if any, falling back to mock for now as requested primarily for campaigns */}
                             {campaigns.filter(c => c.type === 'automation').map(a => (
                                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 dark:text-white font-medium">{a.name}</td>
                                    <td className="px-6 py-4 dark:text-slate-300">
                                        {a.trigger === 'lead_created' ? 'Novo Lead' : 'Tag Adicionada'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs uppercase">{a.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {tab === 'audiences' && (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Nome</th>
                                <th className="px-6 py-3 text-left">Filtros</th>
                                <th className="px-6 py-3 text-left">Contagem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {audiences.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 dark:text-white font-medium">{a.name}</td>
                                    <td className="px-6 py-4 dark:text-slate-300 font-mono text-xs">{a.filters}</td>
                                    <td className="px-6 py-4 dark:text-slate-300">{a.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={tab === 'one-shot' ? 'Nova Campanha' : tab === 'automation' ? 'Nova Automação' : 'Novo Público'}
            >
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                    <input required name="name" placeholder="Nome" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    {tab === 'one-shot' && (
                        <>
                            <input name="target" placeholder="Público Alvo (ex: tags:vip)" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                            <textarea name="message" required placeholder="Mensagem do disparo..." className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" rows="3"></textarea>
                        </>
                    )}
                    {tab === 'automation' && (
                        <>
                            <select name="trigger" required className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white">
                                <option value="lead_created">Quando Lead for Criado</option>
                                <option value="tag_added">Quando Tag for Adicionada</option>
                            </select>
                            <textarea name="message" required placeholder="Mensagem automática..." className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" rows="3"></textarea>
                        </>
                    )}
                    {tab === 'audiences' && (
                        <input
                            name="filters"
                            required
                            placeholder="Filtros (ex: status:active)"
                            className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                        />
                    )}
                    <div className="flex justify-end">
                        <button className="bg-primary-600 text-white px-4 py-2 rounded">Salvar e Disparar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Campaigns;
