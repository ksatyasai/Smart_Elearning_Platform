/**
 * AITutor.jsx
 * AI-powered tutoring chat interface
 */
import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Sparkles,
    User,
    Bot,
    Lightbulb,
    FileQuestion,
    BookOpen,
    RotateCcw,
    Copy,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './AITutor.css';

/**
 * AITutor component
 * Chat-style interface for AI tutoring assistance
 */
const AITutor = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Suggested prompts
    const suggestedPrompts = [
        {
            icon: Lightbulb,
            title: 'Explain a concept',
            prompt: 'Can you explain the concept of backpropagation in neural networks?'
        },
        {
            icon: FileQuestion,
            title: 'Generate a quiz',
            prompt: 'Generate a 5-question quiz on machine learning basics'
        },
        {
            icon: BookOpen,
            title: 'Summarize a topic',
            prompt: 'Summarize the key differences between supervised and unsupervised learning'
        }
    ];

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    content: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI learning assistant. I can help you with:\n\n• Explaining complex concepts\n• Generating practice quizzes\n• Answering questions about your courses\n• Providing study tips and strategies\n\nHow can I help you today?`,
                    timestamp: new Date()
                }
            ]);
        }
    }, []);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mock AI response
    const generateAIResponse = async (userMessage) => {
        // Simulate typing delay
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock responses based on keywords
        let response = '';
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('backpropagation')) {
            response = `**Backpropagation** is a fundamental algorithm in neural networks used for training. Here's a simple explanation:\n\n1. **Forward Pass**: Input data flows through the network, producing an output\n\n2. **Calculate Error**: Compare the output with the expected result using a loss function\n\n3. **Backward Pass**: Calculate how much each weight contributed to the error using the chain rule of calculus\n\n4. **Update Weights**: Adjust weights in the opposite direction of the gradient to minimize error\n\nThink of it like this: if you missed a basketball shot, you'd analyze what went wrong (too much force? wrong angle?) and adjust. Backpropagation does this mathematically!\n\nWould you like me to explain the math behind it or provide a practical example?`;
        } else if (lowerMessage.includes('quiz')) {
            response = `Here's a quick quiz on Machine Learning basics:\n\n**Q1:** What is the main difference between supervised and unsupervised learning?\n\n**Q2:** What is overfitting and how can you prevent it?\n\n**Q3:** Name three common activation functions used in neural networks.\n\n**Q4:** What is the purpose of a validation set?\n\n**Q5:** Explain the bias-variance tradeoff.\n\nTake your time to think about these! Let me know when you're ready, and I'll provide the answers and explanations. 📚`;
        } else if (lowerMessage.includes('supervised') && lowerMessage.includes('unsupervised')) {
            response = `Great question! Here's a comparison:\n\n**Supervised Learning** 📊\n• Uses labeled training data\n• Model learns input → output mapping\n• Examples: Email spam detection, house price prediction\n• Common algorithms: Linear Regression, Decision Trees, SVM\n\n**Unsupervised Learning** 🔍\n• Uses unlabeled data\n• Model finds hidden patterns/structure\n• Examples: Customer segmentation, anomaly detection\n• Common algorithms: K-Means, PCA, Autoencoders\n\n**Key Difference**: Supervised learning needs a "teacher" (labels), while unsupervised learning discovers patterns independently.`;
        } else {
            response = `That's a great topic to explore! Based on your question about "${userMessage.slice(0, 50)}...", let me provide some insights:\n\n1. **Key Concepts**: This topic involves understanding fundamental principles and their applications.\n\n2. **Practical Applications**: Real-world scenarios where this knowledge is valuable.\n\n3. **Further Learning**: Resources and next steps to deepen your understanding.\n\nWould you like me to elaborate on any specific aspect? I can also generate practice questions or provide more detailed examples!`;
        }

        setIsTyping(false);
        return response;
    };

    // Handle sending message
    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        inputRef.current?.focus();

        // Generate AI response
        const aiResponse = await generateAIResponse(inputValue);

        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'bot',
            content: aiResponse,
            timestamp: new Date()
        }]);
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle suggested prompt click
    const handlePromptClick = (prompt) => {
        setInputValue(prompt);
        inputRef.current?.focus();
    };

    // Clear chat
    const clearChat = () => {
        setMessages([{
            id: 1,
            type: 'bot',
            content: `Chat cleared! How can I help you today?`,
            timestamp: new Date()
        }]);
    };

    // Copy message
    const copyMessage = (content) => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className="ai-tutor-page">
            {/* Sidebar with suggestions */}
            <aside className="tutor-sidebar">
                <div className="sidebar-header">
                    <Sparkles size={20} />
                    <span>AI Tutor</span>
                </div>

                <div className="suggested-prompts">
                    <h3>Quick Actions</h3>
                    {suggestedPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            className="prompt-card"
                            onClick={() => handlePromptClick(prompt.prompt)}
                        >
                            <prompt.icon size={18} className="prompt-icon" />
                            <span>{prompt.title}</span>
                        </button>
                    ))}
                </div>

                <div className="sidebar-actions">
                    <button className="action-btn" onClick={clearChat}>
                        <RotateCcw size={16} />
                        New Chat
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                {/* Messages */}
                <div className="messages-container">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.type}`}
                        >
                            <div className="message-avatar">
                                {message.type === 'user' ? (
                                    user?.name?.charAt(0) || <User size={18} />
                                ) : (
                                    <Sparkles size={18} />
                                )}
                            </div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-sender">
                                        {message.type === 'user' ? 'You' : 'AI Tutor'}
                                    </span>
                                    <span className="message-time">
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="message-text">
                                    {message.content.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                                {message.type === 'bot' && (
                                    <div className="message-actions">
                                        <button
                                            className="msg-action-btn"
                                            onClick={() => copyMessage(message.content)}
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button className="msg-action-btn" title="Helpful">
                                            <ThumbsUp size={14} />
                                        </button>
                                        <button className="msg-action-btn" title="Not helpful">
                                            <ThumbsDown size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="message bot">
                            <div className="message-avatar">
                                <Sparkles size={18} />
                            </div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about your courses..."
                            rows={1}
                            className="chat-input"
                        />
                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="input-hint">
                        AI Tutor can make mistakes. Verify important information.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AITutor;
