import { useEffect, useState } from 'react';
import api from '../../services/api';
import ChartComponent from '../../components/Charts/ChartComponent';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/reports');
                setSummary(data);
            } catch (error) {
                console.error('Erro ao carregar relatórios:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading || !summary) return <div>Carregando...</div>;

    const { kpis, charts } = summary;

    return (
        <div className="space-y-6 fade-in">
            <h2 className="text-xl font-bold dark:text-white">Relatórios de Desempenho</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Faturamento Estimado</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                        R$ {kpis.totalRevenue.toLocaleString('pt-BR')}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Taxa de Conversão</p>
                    <p className="text-2xl font-bold mt-1 text-blue-600">
                        {kpis.conversionRate}%
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ticket Médio Estimado</p>
                    <p className="text-2xl font-bold mt-1 text-purple-600">
                        R$ {kpis.avgTicket.toLocaleString('pt-BR')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="mb-4 font-semibold dark:text-white">Evolução de Vendas</h3>
                    <div className="h-64">
                        <ChartComponent
                            type="bar"
                            data={{
                                labels: charts.weeklyTrend.labels,
                                datasets: [{ label: 'Mensagens por dia', data: charts.weeklyTrend.data, backgroundColor: '#0ea5e9' }]
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h3 className="mb-4 font-semibold dark:text-white">Origem dos Leads</h3>
                    <div className="h-64">
                        <ChartComponent
                            type="doughnut"
                            data={{
                                labels: charts.leadsBySource.labels,
                                datasets: [{
                                    label: 'Origem dos Leads',
                                    data: charts.leadsBySource.data,
                                    backgroundColor: ['#ec4899', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#f97316']
                                }]
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
