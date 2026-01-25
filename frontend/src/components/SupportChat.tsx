import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. useLocation ekle
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'ai';
}

// 2. Dil Bazlı Karşılama Mesajları
const GREETINGS = {
    'pt-br': "Olá! 👋 Como posso ajudar você com a TerraVest hoje?",
    'es': "¡Hola! 👋 ¿Cómo puedo ayudarte con TerraVest hoy?",
    'fr': "Bonjour! 👋 Comment puis-je vous aider avec TerraVest aujourd'hui?",
    'en': "Hi! 👋 How can I help you with TerraVest today?"
};

export default function SupportChat() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 3. Dil Algılama ve İlk Mesajı Ayarlama
    // URL değişirse (örn: kullanıcı dil değiştirirse) chat sıfırlanabilir veya mevcut kalabilir.
    // Burada sadece ilk yüklemede dili algılıyoruz.
    useEffect(() => {
        const path = location.pathname.toLowerCase();
        let currentLang = 'en';

        if (path.startsWith('/pt-br')) currentLang = 'pt-br';
        else if (path.startsWith('/es')) currentLang = 'es';
        else if (path.startsWith('/fr')) currentLang = 'fr';

        // Eğer mesaj kutusu boşsa, o dilin karşılama mesajını ekle
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'init',
                    role: 'ai',
                    // @ts-ignore
                    text: GREETINGS[currentLang] || GREETINGS['en']
                }
            ]);
        }
    }, [location.pathname]); // Path değişince tekrar kontrol edebilirsin (Opsiyonel)

    // ... scroll effect aynen kalıyor ...
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, role: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // 4. Mevcut Dili Belirle (Backend'e göndermek için)
        const path = location.pathname.toLowerCase();
        let activeLang = 'en';
        if (path.startsWith('/pt-br')) activeLang = 'pt-br';
        else if (path.startsWith('/es')) activeLang = 'es';
        else if (path.startsWith('/fr')) activeLang = 'fr';

        try {
            const history = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                // 5. Backend'e 'language' parametresini de gönderiyoruz
                body: JSON.stringify({ message: userMsg.text, history, language: activeLang })
            });

            const data = await response.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "Sorry, I couldn't reach the server.",
                role: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            setMessages(prev => [...prev, { id: 'err', role: 'ai', text: "Connection error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ... render kısmı (return) aynı kalacak ...
    return (
        // ... (Aynı JSX kodları) ...
        // Sadece JSX içinde bir değişiklik yok, mantık yukarıda değişti.
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
            {/* ... CHAT PENCERESİ VE BUTON KODLARI AYNEN KORUNACAK ... */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    <div className="bg-[#0F172A] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-bold">TerraVest Support</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#009B9E] text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-[#009B9E]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#009B9E] outline-none text-slate-800"
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="bg-[#0F172A] text-white p-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-50">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="bg-[#009B9E] hover:bg-[#00888a] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group">
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}