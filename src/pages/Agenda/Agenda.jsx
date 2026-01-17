import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import { Icons } from '../../components/UI/Icons';
import { useToast } from '../../context/ToastContext';

const Agenda = () => {
    const [events, setEvents] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToast } = useToast();

    const fetchData = async () => {
        try {
            const [appointmentsRes, clientsRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/clients')
            ]);
            setEvents(appointmentsRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            console.error("Erro ao carregar agenda:", error);
            addToast('Erro ao carregar dados.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div>Carregando...</div>;

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        
        const dateStr = fd.get('date');
        const timeStr = fd.get('time');
        const dateTimeObj = new Date(`${dateStr}T${timeStr}:00`);

        if (Number.isNaN(dateTimeObj.getTime())) {
            addToast('Data ou hora inválida.', 'error');
            return;
        }

        if (dateTimeObj < new Date()) {
            addToast('A data/hora deve ser no futuro.', 'error');
            return;
        }

        const dateTime = dateTimeObj.toISOString();

        const newEvent = {
            title: fd.get('title'),
            date: dateTime,
            clientId: fd.get('clientId'),
            notes: '',
            status: 'scheduled'
        };

        try {
            await api.post('/appointments', newEvent);
            addToast('Agendamento criado com sucesso!');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            addToast('Erro ao criar agendamento.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Remover agendamento?')) {
            try {
                await api.delete(`/appointments/${id}`);
                setEvents(events.filter(e => e.id !== id));
                addToast('Agendamento removido.', 'info');
            } catch (error) {
                console.error(error);
                addToast('Erro ao remover.', 'error');
            }
        }
    };

    // Helper para formatar data/hora de exibição
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Agenda de Compromissos</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Icons.Plus className="w-5 h-5" /> Novo Agendamento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(evt => {
                    const { date, time } = formatDateTime(evt.date);
                    return (
                        <div key={evt.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 border-primary-500 relative group">
                            <button
                                onClick={() => handleDelete(evt.id)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Icons.Trash className="w-4 h-4" />
                            </button>
                            <div className="flex items-start justify-between mb-2">
                                <div className="font-bold dark:text-white">{evt.title}</div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
                                <Icons.Calendar className="w-4 h-4" />
                                <span>{date} às {time}</span>
                            </div>
                            {evt.client && (
                                <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1 rounded inline-block">
                                    Cliente: {evt.client.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Compromisso">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 dark:text-white">Título</label>
                        <input required name="title" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1 dark:text-white">Data</label>
                            <input required type="date" name="date" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 dark:text-white">Hora</label>
                            <input required type="time" name="time" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm mb-1 dark:text-white">Vincular Cliente (Obrigatório)</label>
                        <select required name="clientId" className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white">
                            <option value="">Selecione um cliente...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agenda;
