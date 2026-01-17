// Mock Data Store
// In a real app, this would be a database or API response

export const USERS = [{ id: 1, name: 'Admin User', email: 'admin@crm.com', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin+User' }];

export const CLIENTS = [
    { id: 1, name: 'João Silva', phone: '11999887766', email: 'joao@email.com', tags: ['vip', 'recorrente'], status: 'active' },
    { id: 2, name: 'Maria Souza', phone: '11988776655', email: 'maria@email.com', tags: ['novo'], status: 'lead' },
    { id: 3, name: 'Perfil Instagram', phone: '', email: 'insta@cliente.com', tags: ['instagram'], status: 'active' },
];

export const TICKETS = [
    {
        id: 101,
        clientId: 1,
        status: 'open',
        priority: 'high',
        channel: 'whatsapp',
        messages: [
            { id: 1, sender: 'client', text: 'Bom dia, orçamento de manipulado?', timestamp: '2023-10-25T10:00:00' }
        ]
    },
    {
        id: 102,
        clientId: 2,
        status: 'open',
        priority: 'medium',
        channel: 'instagram',
        messages: [
            { id: 1, sender: 'client', text: 'Vi uma promoção no Instagram, ainda está valendo?', timestamp: '2023-10-26T11:20:00' }
        ]
    },
    {
        id: 103,
        clientId: 3,
        status: 'open',
        priority: 'low',
        channel: 'messenger',
        messages: [
            { id: 1, sender: 'client', text: 'Olá, gostaria de tirar uma dúvida rápida.', timestamp: '2023-10-26T12:45:00' }
        ]
    }
];

export const KPIS = { firstResponseTime: '2m', avgResponseTime: '5m', clientsServed: 124, newClients: 15, aiBudgets: 45, messagesExchanged: 3200 };

export const CAMPAIGNS = [{ id: 1, name: 'Promoção de Inverno', status: 'sent', target: 'VIPs', sent_at: '2023-06-15', reach: 1540 }];

export const EVENTS = [
    { id: 1, title: 'Reunião de Alinhamento', date: '2023-10-27', time: '14:00', clientId: 1 },
    { id: 2, title: 'Apresentação de Proposta', date: '2023-10-28', time: '10:00', clientId: 2 }
];

// Simulation Service
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const MockService = {
    getClients: async () => { await delay(400); return [...CLIENTS]; },
    getTickets: async () => { await delay(400); return [...TICKETS]; },
    getKPIs: async () => { await delay(300); return { ...KPIS }; },
    getUsers: async () => { await delay(300); return JSON.parse(localStorage.getItem('crm_users')) || [...USERS]; },
    saveUsers: async (users) => { localStorage.setItem('crm_users', JSON.stringify(users)); },
    getCampaigns: async () => { await delay(400); return [...CAMPAIGNS]; },
    getEvents: async () => { await delay(400); return [...EVENTS]; },
    addEvent: async (event) => { await delay(400); return { ...event, id: Date.now() }; },
    deleteEvent: async () => { await delay(400); return true; }
};
