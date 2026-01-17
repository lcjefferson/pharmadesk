import { useEffect, useState } from 'react';
import api from '../../services/api';
import ChartComponent from '../../components/Charts/ChartComponent';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/reports');
                setSummary(data);
            } catch (error) {
                console.error('Erro ao carregar métricas do dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading || !summary) return <div>Carregando...</div>;

    const kpis = summary.kpis;

    const cards = [
        { t: 'T.M. Resposta', v: kpis.avgResponseTime, b: 'bg-blue-500' },
        { t: 'Novos Clientes', v: kpis.newClients, b: 'bg-green-500' },
        { t: 'Msgs Trocadas', v: kpis.messagesExchanged, b: 'bg-purple-500' },
        { t: 'Orçamentos', v: kpis.aiBudgets, b: 'bg-amber-500' }
    ];

    return (
        <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map(k => (
                    <div key={k.t} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{k.t}</p>
                            <p className="text-2xl font-bold dark:text-white">{k.v}</p>
                        </div>
                        <div className={`h-10 w-10 rounded-full ${k.b}`}></div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow h-80">
                <h3 className="mb-4 font-semibold dark:text-white">Tendência Semanal</h3>
                <div className="h-64">
                    <ChartComponent
                        type="line"
                        data={{
                            labels: summary.charts.weeklyTrend.labels,
                            datasets: [{ label: 'Mensagens por dia', data: summary.charts.weeklyTrend.data, borderColor: '#0ea5e9' }]
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
