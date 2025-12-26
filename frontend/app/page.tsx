'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './page.module.css';

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface ChatResponse {
    text?: string;
    output?: string;
    response?: string;
    events?: any[];
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I'm your Zoo Tour Guide. Ask me about our animals or anything else!" }
    ]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMessage.content }),
            });

            const data: ChatResponse = await res.json();

            // Attempt to find the text response in various fields common in ADK/LangChain responses
            const text = data.output || data.response || data.text || JSON.stringify(data);

            setMessages(prev => [...prev, { role: 'model', content: text || "No response text found." }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error connecting to the zoo database." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Sparkles className={styles.icon} />
                    <h1>Zoo<span className={styles.highlight}>Agent</span></h1>
                </div>
            </header>

            <div className={styles.chatContainer}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.modelRow}`}>
                        {msg.role === 'model' && (
                            <div className={styles.avatar}>
                                <Bot size={20} />
                            </div>
                        )}

                        <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.modelBubble}`}>
                            {msg.role === 'model' ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className={styles.avatar}>
                                <User size={20} />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className={styles.messageRow}>
                        <div className={styles.avatar}><Bot size={20} /></div>
                        <div className={`${styles.bubble} ${styles.modelBubble} ${styles.loading}`}>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about lions, tigers, or the world..."
                        className={styles.input}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className={styles.sendBtn}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </main>
    );
}
