import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import api from "../api/axios"; // This automatically adds your Token

const Chat = () => {
    // Initial welcome message
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Hello! I have access to your portfolio and recent transactions. Ask me for advice!", 
            sender: "bot" 
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Auto-scroll to bottom ref
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 1. Add User Message immediately to UI
        const userMsg = { id: Date.now(), text: input, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        const questionText = input; // Store for API call
        setInput(""); // Clear input
        setLoading(true);

        try {
            // 2. CALL YOUR REAL BACKEND
            // Your backend expects: request.question
            const response = await api.post("/chat", { 
                question: questionText 
            });

            // 3. Add Bot Response to UI
            // Your backend returns: {"response": ai_response}
            const botText = response.data.response;
            
            const botMsg = { id: Date.now() + 1, text: botText, sender: "bot" };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = error.response?.data?.detail || "Failed to connect to AI server.";
            
            const errorMsg = { 
                id: Date.now() + 1, 
                text: errorMessage, 
                sender: "bot", 
                isError: true 
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        "Analyze my spending habits",
        "Should I invest more in Tech?",
        "Am I saving enough this month?",
        "Explain my recent transaction"
    ];

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col max-w-5xl mx-auto p-4 md:p-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">AI Financial Advisor</h1>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                        Connected to your Portfolio
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                msg.sender === 'user' ? 'bg-slate-700' : 'bg-primary'
                            }`}>
                                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            {/* Bubble */}
                            <div className={`p-4 rounded-2xl max-w-[80%] leading-relaxed ${
                                msg.sender === 'user' 
                                ? 'bg-slate-800 text-white rounded-tr-none' 
                                : msg.isError 
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                    : 'bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-tl-none shadow-lg shadow-blue-500/10'
                            }`}>
                                {msg.isError && <AlertCircle size={16} className="inline mr-2 mb-1"/>}
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {/* Loading Indicator */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Bot size={20} />
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </motion.div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative">
                {/* Suggestions (Only show if chat is empty/fresh) */}
                {messages.length < 3 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => setInput(s)} 
                                className="whitespace-nowrap px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm text-slate-300 transition-colors flex items-center gap-2"
                            >
                                <Sparkles size={14} className="text-accent" /> {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="bg-card p-2 rounded-2xl border border-slate-700 flex items-center gap-2 shadow-xl focus-within:border-primary transition-colors">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your finances..."
                        className="flex-1 bg-transparent text-white p-3 outline-none placeholder:text-slate-500"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !input.trim()}
                        className="p-3 bg-primary hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;