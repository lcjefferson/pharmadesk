import api from '../services/api';

// AI Agent Simulation Logic

const DEFAULT_SYSTEM_MESSAGE = `
Você é um agente de IA integrado ao sistema de atendimento. Seu papel:
- Resumir históricos de atendimento.
- Sugerir respostas automáticas baseadas em palavras-chave.
- Corrigir ortografia.
- Indicar regras da empresa para conduta.
- Gerar orçamentos a partir de receitas (OCR).
- Identificar intenção do cliente: medicação pronta ou manipulado.
- Se manipulado -> gerar orçamento via IA.
- Se medicação pronta -> disparar pedido para ERP.
Comporte-se como um fluxo do N8N: modular, orientado a eventos, pronto para integração com APIs externas.
`;

export const AI_CONFIG = {
    systemMessage: DEFAULT_SYSTEM_MESSAGE,
    temperature: 0.7,
    activeFeatures: {
        summary: true,
        grammar: true,
        autoReply: true,
        erpIntegration: false
    },
    erpConfig: {
        url: '',
        token: ''
    }
};

export const IAAgent = {
    getConfig: async () => {
        try {
            const { data } = await api.get('/settings/ai_config');
            return data && data.value ? data.value : AI_CONFIG;
        } catch (error) {
            console.error('Erro ao carregar config IA:', error);
            // Fallback to local storage if API fails (optional, or just return default)
            const saved = localStorage.getItem('ai_config');
            return saved ? JSON.parse(saved) : AI_CONFIG;
        }
    },

    saveConfig: async (config) => {
        try {
            await api.put('/settings/ai_config', { value: config });
            // Keep local storage in sync for fallback/offline potential?
            localStorage.setItem('ai_config', JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Erro ao salvar config IA:', error);
            return false;
        }
    },

    analyzeIntent: (message) => {
        const lower = message.toLowerCase();
        if (lower.includes('receita') || lower.includes('manipula') || lower.includes('orçamento')) {
            return 'manipulado';
        }
        if (lower.includes('tem') || lower.includes('preço') || lower.includes('comprar')) {
            return 'pronta_entrega';
        }
        return 'duvida_geral';
    },

    suggestReply: async (lastMessage) => {
        // Simulate AI thinking time
        await new Promise(r => setTimeout(r, 800));

        const intent = IAAgent.analyzeIntent(lastMessage);

        if (intent === 'manipulado') {
            return "Olá! Posso sim fazer um orçamento para seus manipulados. Poderia me enviar uma foto da receita?";
        }
        if (intent === 'pronta_entrega') {
            return "Vou verificar nosso estoque agora mesmo. Um momento, por favor.";
        }
        return "Como posso ajudar você hoje?";
    },

    generateSummary: async () => {
        await new Promise(r => setTimeout(r, 1000));
        return "Cliente solicitou orçamento de manipulados. Receita recebida e em análise.";
    }
};
