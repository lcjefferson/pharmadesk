import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/UI/Modal';
import { Icons } from '../../components/UI/Icons';
import { useToast } from '../../context/ToastContext';
import { io } from 'socket.io-client';

const Service = () => {
    const [clients, setClients] = useState([]);
    const [activeClientId, setActiveClientId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [typingInfo, setTypingInfo] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [clientStatusFilter, setClientStatusFilter] = useState('all');
    const [messageSearch, setMessageSearch] = useState('');
    
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const { addToast } = useToast();
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Load Clients
    useEffect(() => {
        fetchClients();
    }, []);

    // Handle Socket Events
    useEffect(() => {
        if (!socket) return;

        socket.on('msgToClient', (message) => {
            if (message.clientId === activeClientId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        });

        socket.on('typing', (data) => {
            if (data.clientId === activeClientId && data.isTyping) {
                setTypingInfo('Digitando...');
            } else {
                setTypingInfo(null);
            }
        });

        return () => {
            socket.off('msgToClient');
            socket.off('typing');
        };
    }, [socket, activeClientId]);

    // Join Room when active client changes
    useEffect(() => {
        if (socket && activeClientId) {
            socket.emit('joinRoom', activeClientId);
            fetchMessages(activeClientId);
        }
    }, [activeClientId, socket]);

    // Auto-select client from location state
    useEffect(() => {
        if (clients.length > 0 && location.state?.client && !activeClientId) {
            setActiveClientId(location.state.client.id);
        } else if (clients.length > 0 && !activeClientId) {
            setActiveClientId(clients[0].id);
        }
    }, [clients, location.state]);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            addToast('Erro ao carregar clientes.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (clientId) => {
        try {
            const res = await api.get(`/messages?clientId=${clientId}`);
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async () => {
        if (!input.trim() && !isUploading) return;

        const messageData = {
            clientId: activeClientId,
            content: input,
            sender: 'agent',
            type: 'text'
        };

        try {
            // Optimistic update handled by socket return, but we can clear input immediately
            setInput('');
            inputRef.current?.focus();
            socket.emit('msgToServer', messageData);
            socket.emit('typing', { clientId: activeClientId, isTyping: false });
        } catch (error) {
            console.error("Erro ao enviar:", error);
            addToast('Erro ao enviar mensagem.', 'error');
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        
        if (socket && activeClientId) {
            socket.emit('typing', { clientId: activeClientId, isTyping: true });
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { clientId: activeClientId, isTyping: false });
            }, 1000);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mock upload functionality for now (real version would upload to server/S3 and get URL)
        // Here we just convert to base64 to simulate processing
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result; // Data URL
            
            // Send as message
            const msg = {
                id: Date.now(),
                content: base64,
                fileName: file.name,
                fileUrl: base64,
                sender: 'agent',
                createdAt: new Date().toISOString(),
                clientId: activeClientId,
                type: file.type.startsWith('image/') ? 'image' : 'document'
            };

            setMessages(prev => [...prev, msg]);
            if (socket) socket.emit('msgToServer', msg);

            // Trigger AI analysis if it's an image
            if (file.type.startsWith('image/')) {
                 try {
                     const response = await api.post('/ai/analyze-image', { 
                         imageUrl: base64, // Caution: Large payload. Ideally use URL.
                         prompt: 'Esta é uma receita ou documento médico? Se sim, extraia os medicamentos, dosagens e instruções para orçamento.'
                     });
                     
                     if (response.data && response.data.text) {
                         const aiReply = {
                             id: Date.now() + 1,
                             content: `🤖 Análise de Receita (IA):\n${response.data.text}`,
                             sender: 'agent',
                             createdAt: new Date().toISOString(),
                             clientId: activeClientId,
                             type: 'text'
                         };
                         setMessages(prev => [...prev, aiReply]);
                     }
                 } catch (err) {
                     console.error("Erro na análise de IA:", err);
                     addToast("Erro ao analisar imagem com IA", "error");
                 }
            }

            setIsUploading(false);
            e.target.value = null;
        };
        reader.readAsDataURL(file);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const activeClient = clients.find(c => c.id === activeClientId);

    const normalizedClientSearch = clientSearch.toLowerCase();

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            !normalizedClientSearch ||
            client.name?.toLowerCase().includes(normalizedClientSearch) ||
            client.email?.toLowerCase().includes(normalizedClientSearch) ||
            client.phone?.toLowerCase().includes(normalizedClientSearch);

        const matchesStatus =
            clientStatusFilter === 'all' ||
            (clientStatusFilter === 'active' && client.status === 'active') ||
            (clientStatusFilter === 'inactive' && client.status === 'inactive');

        return matchesSearch && matchesStatus;
    });

    const normalizedMessageSearch = messageSearch.toLowerCase();

    const filteredMessages = messages.filter((m) => {
        if (!normalizedMessageSearch) return true;
        const content = (m.content || '').toString().toLowerCase();
        const fileName = (m.fileName || '').toString().toLowerCase();
        return (
            content.includes(normalizedMessageSearch) ||
            fileName.includes(normalizedMessageSearch)
        );
    });

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden fade-in">
            {/* Sidebar de Clientes */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
                <div className="p-4 border-b dark:border-slate-700 dark:text-white">
                    <div className="font-bold mb-3">
                        Atendimentos
                    </div>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Buscar cliente por nome, e-mail ou telefone"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded text-sm dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <select
                            value={clientStatusFilter}
                            onChange={(e) => setClientStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded text-sm dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Todos os status</option>
                            <option value="active">Somente ativos</option>
                            <option value="inactive">Somente inativos</option>
                        </select>
                    </div>
                </div>
                {filteredClients.map(client => (
                    <div
                        key={client.id}
                        onClick={() => setActiveClientId(client.id)}
                        className={`p-4 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${activeClientId === client.id ? 'bg-blue-50 dark:bg-slate-700' : ''}`}
                    >
                        <div className="font-bold dark:text-white truncate">{client.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                            {client.email || client.phone}
                        </div>
                    </div>
                ))}
                {filteredClients.length === 0 && (
                    <div className="p-4 text-center text-slate-500">Nenhum cliente encontrado.</div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeClientId ? (
                    <>
                        <div className="p-4 border-b dark:border-slate-700 dark:text-white font-bold bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span>{activeClient?.name}</span>
                                {typingInfo && <span className="text-xs text-green-600 animate-pulse font-normal ml-2">{typingInfo}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={messageSearch}
                                    onChange={(e) => setMessageSearch(e.target.value)}
                                    placeholder="Buscar na conversa"
                                    className="w-56 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded text-xs dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-900/50">
                            {filteredMessages.map((m, idx) => (
                                <div key={m.id || idx} className={`flex ${m.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-[75%] ${
                                        m.sender === 'agent' 
                                            ? 'bg-primary-600 text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-slate-700 dark:text-white rounded-tl-none'
                                    }`}>
                                        {m.type === 'text' && <div>{m.content}</div>}
                                        {m.type === 'image' && (
                                            <div className="space-y-1">
                                                <img src={m.fileUrl || m.content} alt="Anexo" className="max-w-full rounded" />
                                                <a href={m.fileUrl || m.content} target="_blank" rel="noreferrer" className="text-xs underline block opacity-80">Ver original</a>
                                            </div>
                                        )}
                                        {m.type === 'audio' && (
                                            <audio controls src={m.fileUrl || m.content} className="max-w-full" />
                                        )}
                                        {m.type === 'document' && (
                                            <div className="flex items-center gap-2">
                                                <Icons.Paperclip className="w-5 h-5" />
                                                <a href={m.fileUrl || m.content} target="_blank" rel="noreferrer" className="underline">{m.fileName || 'Documento'}</a>
                                            </div>
                                        )}
                                        <div className={`text-[10px] mt-1 text-right ${m.sender === 'agent' ? 'text-primary-100' : 'text-slate-400'}`}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                    accept="image/*,application/pdf"
                                />
                                <button 
                                    className="text-slate-400 hover:text-primary-600 p-2" 
                                    title="Enviar imagem/receita"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Icons.Paperclip className="w-5 h-5" />
                                </button>
                                <button 
                                    className="text-slate-400 hover:text-primary-600 p-2" 
                                    title="Gravar Áudio (Em breve)"
                                    onClick={() => addToast('Gravação de áudio será implementada em breve!', 'info')}
                                >
                                    <Icons.Microphone className="w-5 h-5" />
                                </button>
                                
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    className="flex-1 border p-2 rounded dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder={isUploading ? "Enviando arquivo..." : "Digite uma mensagem..."}
                                    disabled={isUploading}
                                />
                                <button 
                                    onClick={handleSendMessage} 
                                    className="bg-primary-600 text-white p-2 rounded hover:bg-primary-700 disabled:opacity-50"
                                    disabled={isUploading || (!input.trim())}
                                >
                                    {isUploading ? <Icons.Sparkles className="w-5 h-5 animate-spin" /> : <Icons.PaperAirplane className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        Selecione um cliente para iniciar o atendimento
                    </div>
                )}
            </div>
        </div>
    );
};

export default Service;
