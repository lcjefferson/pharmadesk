import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const defaultConfig = {
    provider: 'openai', // 'openai' | 'anthropic' | 'local'
    apiKey: '',
    systemPrompt: 'Você é um assistente útil.',
    temperature: 0.7,
    visionEnabled: true,
    audioEnabled: true,
    erpUrl: '',
    erpToken: '',
    channels: {
        whatsapp: {
            officialEnabled: false,
            officialApiKey: '',
            phoneNumber: '',
            unofficialEnabled: false,
            uazapiUrl: '',
            uazapiToken: ''
        },
        instagram: {
            officialEnabled: false,
            appId: '',
            appSecret: '',
            businessAccountId: ''
        },
        messenger: {
            officialEnabled: false,
            pageId: '',
            accessToken: '',
            verifyToken: ''
        }
    }
};

const Settings = () => {
    const [config, setConfig] = useState(defaultConfig);
    const { addToast } = useToast();

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await api.get('/settings/ai_config');
                let saved = null;

                if (data && data.value) {
                    saved = data.value;
                } else {
                    // Tenta migrar do localStorage se não existir no backend
                    const local = localStorage.getItem('ai_config');
                    if (local) {
                        try {
                            saved = JSON.parse(local);
                            // Salva no backend para persistência futura
                            await api.put('/settings/ai_config', { value: saved });
                        } catch (e) {
                            console.error('Configuração local inválida', e);
                        }
                    }
                }

                if (saved) {
                    setConfig(prev => ({
                        ...defaultConfig,
                        ...saved,
                        channels: {
                            ...defaultConfig.channels,
                            ...(saved.channels || {}),
                            whatsapp: {
                                ...defaultConfig.channels.whatsapp,
                                ...(saved.channels && saved.channels.whatsapp ? saved.channels.whatsapp : {})
                            },
                            instagram: {
                                ...defaultConfig.channels.instagram,
                                ...(saved.channels && saved.channels.instagram ? saved.channels.instagram : {})
                            },
                            messenger: {
                                ...defaultConfig.channels.messenger,
                                ...(saved.channels && saved.channels.messenger ? saved.channels.messenger : {})
                            }
                        }
                    }));
                }
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings/ai_config', { value: config });
            addToast('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            addToast('Erro ao salvar configurações.', 'error');
        }
    };

    return (
        <div className="max-w-2xl bg-white dark:bg-slate-800 rounded shadow p-6 fade-in">
            <h2 className="text-xl font-bold dark:text-white mb-6">Configurações do Agente IA</h2>
            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border dark:border-slate-600">
                    <h3 className="font-semibold dark:text-white mb-4">Provedor de Inteligência Artificial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Provedor</label>
                            <select
                                value={config.provider}
                                onChange={e => setConfig({ ...config, provider: e.target.value })}
                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="openai">OpenAI (GPT-4o / Whisper)</option>
                                <option value="anthropic">Anthropic (Claude 3.5)</option>
                                <option value="local">Local (Ollama/Llama3)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">API Key</label>
                            <input
                                type="password"
                                value={config.apiKey}
                                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder="sk-..."
                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                        <label className="flex items-center gap-2 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={config.visionEnabled}
                                onChange={e => setConfig({ ...config, visionEnabled: e.target.checked })}
                            />
                            Habilitar Visão (Ler Receitas/Imagens)
                        </label>
                        <label className="flex items-center gap-2 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={config.audioEnabled}
                                onChange={e => setConfig({ ...config, audioEnabled: e.target.checked })}
                            />
                            Habilitar Áudio (Ouvir/Transcrever)
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">System Prompt</label>
                    <textarea
                        rows="4"
                        value={config.systemPrompt}
                        onChange={e => setConfig({ ...config, systemPrompt: e.target.value })}
                        className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-slate-300 mb-1">Temperatura (Criatividade)</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.temperature}
                        onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <div className="text-right text-sm text-slate-500">{config.temperature}</div>
                </div>

                <div className="pt-4 border-t dark:border-slate-700">
                    <h3 className="text-lg font-bold dark:text-white mb-4">Integração ERP</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm dark:text-slate-300">API URL</label>
                            <input
                                value={config.erpUrl}
                                onChange={e => setConfig({ ...config, erpUrl: e.target.value })}
                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm dark:text-slate-300">Token</label>
                            <input
                                type="password"
                                value={config.erpToken}
                                onChange={e => setConfig({ ...config, erpToken: e.target.value })}
                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t dark:border-slate-700">
                    <h3 className="text-lg font-bold dark:text-white mb-4">Canais de Atendimento</h3>

                    <div className="space-y-6">
                        <div className="border rounded p-4 dark:border-slate-700">
                            <h4 className="font-semibold dark:text-white mb-3">WhatsApp</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={config.channels.whatsapp.officialEnabled}
                                        onChange={e =>
                                            setConfig({
                                                ...config,
                                                channels: {
                                                    ...config.channels,
                                                    whatsapp: {
                                                        ...config.channels.whatsapp,
                                                        officialEnabled: e.target.checked
                                                    }
                                                }
                                            })
                                        }
                                    />
                                    Usar API Oficial do WhatsApp
                                </label>
                                {config.channels.whatsapp.officialEnabled && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">Número WhatsApp Business</label>
                                            <input
                                                value={config.channels.whatsapp.phoneNumber}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            whatsapp: {
                                                                ...config.channels.whatsapp,
                                                                phoneNumber: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">Token / API Key</label>
                                            <input
                                                type="password"
                                                value={config.channels.whatsapp.officialApiKey}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            whatsapp: {
                                                                ...config.channels.whatsapp,
                                                                officialApiKey: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t dark:border-slate-700 mt-3">
                                    <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={config.channels.whatsapp.unofficialEnabled}
                                            onChange={e =>
                                                setConfig({
                                                    ...config,
                                                    channels: {
                                                        ...config.channels,
                                                        whatsapp: {
                                                            ...config.channels.whatsapp,
                                                            unofficialEnabled: e.target.checked
                                                        }
                                                    }
                                                })
                                            }
                                        />
                                        Usar API não oficial WhatsApp (Uazapi)
                                    </label>
                                    {config.channels.whatsapp.unofficialEnabled && (
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className="block text-sm dark:text-slate-300">URL da Instância Uazapi</label>
                                                <input
                                                    value={config.channels.whatsapp.uazapiUrl}
                                                    onChange={e =>
                                                        setConfig({
                                                            ...config,
                                                            channels: {
                                                                ...config.channels,
                                                                whatsapp: {
                                                                    ...config.channels.whatsapp,
                                                                    uazapiUrl: e.target.value
                                                                }
                                                            }
                                                        })
                                                    }
                                                    className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm dark:text-slate-300">Token de Acesso</label>
                                                <input
                                                    type="password"
                                                    value={config.channels.whatsapp.uazapiToken}
                                                    onChange={e =>
                                                        setConfig({
                                                            ...config,
                                                            channels: {
                                                                ...config.channels,
                                                                whatsapp: {
                                                                    ...config.channels.whatsapp,
                                                                    uazapiToken: e.target.value
                                                                }
                                                            }
                                                        })
                                                    }
                                                    className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border rounded p-4 dark:border-slate-700">
                            <h4 className="font-semibold dark:text-white mb-3">Instagram</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={config.channels.instagram.officialEnabled}
                                        onChange={e =>
                                            setConfig({
                                                ...config,
                                                channels: {
                                                    ...config.channels,
                                                    instagram: {
                                                        ...config.channels.instagram,
                                                        officialEnabled: e.target.checked
                                                    }
                                                }
                                            })
                                        }
                                    />
                                    Usar API Oficial do Instagram
                                </label>
                                {config.channels.instagram.officialEnabled && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">App ID</label>
                                            <input
                                                value={config.channels.instagram.appId}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            instagram: {
                                                                ...config.channels.instagram,
                                                                appId: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">App Secret</label>
                                            <input
                                                type="password"
                                                value={config.channels.instagram.appSecret}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            instagram: {
                                                                ...config.channels.instagram,
                                                                appSecret: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">Business Account ID</label>
                                            <input
                                                value={config.channels.instagram.businessAccountId}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            instagram: {
                                                                ...config.channels.instagram,
                                                                businessAccountId: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border rounded p-4 dark:border-slate-700">
                            <h4 className="font-semibold dark:text-white mb-3">Messenger</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={config.channels.messenger.officialEnabled}
                                        onChange={e =>
                                            setConfig({
                                                ...config,
                                                channels: {
                                                    ...config.channels,
                                                    messenger: {
                                                        ...config.channels.messenger,
                                                        officialEnabled: e.target.checked
                                                    }
                                                }
                                            })
                                        }
                                    />
                                    Usar API Oficial do Messenger
                                </label>
                                {config.channels.messenger.officialEnabled && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">Page ID</label>
                                            <input
                                                value={config.channels.messenger.pageId}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            messenger: {
                                                                ...config.channels.messenger,
                                                                pageId: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">Access Token</label>
                                            <input
                                                type="password"
                                                value={config.channels.messenger.accessToken}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            messenger: {
                                                                ...config.channels.messenger,
                                                                accessToken: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm dark:text-slate-300">Verify Token</label>
                                            <input
                                                value={config.channels.messenger.verifyToken}
                                                onChange={e =>
                                                    setConfig({
                                                        ...config,
                                                        channels: {
                                                            ...config.channels,
                                                            messenger: {
                                                                ...config.channels.messenger,
                                                                verifyToken: e.target.value
                                                            }
                                                        }
                                                    })
                                                }
                                                className="w-full border rounded p-2 dark:bg-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700">
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
