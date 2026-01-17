import { useState, useEffect } from 'react';
import { IAAgent, AI_CONFIG } from '../agents/iaAgent';

export function useIAAgent() {
    const [config, setConfig] = useState(AI_CONFIG);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        const load = async () => {
            const cfg = await IAAgent.getConfig();
            setConfig(cfg);
        };
        load();
    }, []);

    const updateConfig = async (newConfig) => {
        await IAAgent.saveConfig(newConfig);
        setConfig(newConfig);
    };

    const getSuggestion = async (message) => {
        setLoadingAI(true);
        try {
            const suggestion = await IAAgent.suggestReply(message);
            return suggestion;
        } finally {
            setLoadingAI(false);
        }
    };

    return {
        config,
        updateConfig,
        getSuggestion,
        loadingAI
    };
}
