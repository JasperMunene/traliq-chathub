"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { businessAPI } from "@/lib/business-api"
import { chatAPI, ChatMessage, BotConfig } from "@/lib/chat-api"
import {
    Send,
    Bot,
    User,
    MoreVertical,
    RefreshCw,
    Settings,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Loader2,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Using ChatMessage from chat-api.ts

const Chat = () => {
    const { user } = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [sessionId] = useState(() => chatAPI.generateSessionId())
    const [businessNamespace, setBusinessNamespace] = useState<string | null>(null)
    const [botConfig, setBotConfig] = useState<BotConfig | null>(null)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Initialize chat on component mount
    const initializeChat = useCallback(async () => {
        if (!user) return

        try {
            setIsLoading(true)
            setError(null)

            // Get user's primary business
            const business = await businessAPI.getPrimaryBusiness()
            if (!business) {
                setError('No business found. Please register a business first.')
                return
            }

            setBusinessNamespace(business.namespace)

            // Check chatbot service health
            await chatAPI.healthCheck()
            setIsConnected(true)

            // Get bot configuration
            try {
                const configResponse = await chatAPI.getBotConfig(business.namespace)
                if (configResponse.success) {
                    setBotConfig(configResponse.config)
                }
            } catch (configError) {
                // use the variable so lint is happy and keep a helpful log
                console.warn('Bot config not found, using defaults', configError)
            }

            // Create conversation
            const conversationResponse = await chatAPI.createConversation({
                business_namespace: business.namespace,
                session_id: sessionId,
                customer_id: chatAPI.generateCustomerId(),
                // Use user.name (matches UserProfile) with fallback to email
                customer_name: user.name || user.email,
                customer_email: user.email,
                channel: 'web_chat'
            })

            if (conversationResponse.success) {
                setConversationId(conversationResponse.conversation_id)

                // Add welcome message
                const welcomeMessage: ChatMessage = {
                    id: 'welcome',
                    content: botConfig?.greeting_message || "Hello! I'm here to help you with any questions you might have. How can I assist you today?",
                    sender: 'bot',
                    timestamp: new Date(),
                    status: 'sent'
                }
                setMessages([welcomeMessage])
            }

        } catch (err) {
            console.error('Failed to initialize chat:', err)
            setError(err instanceof Error ? err.message : 'Failed to connect to chat service')
            setIsConnected(false)
            toast.error("Failed to connect to chat service. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [user, sessionId, botConfig])

    useEffect(() => {
        initializeChat()
    }, [initializeChat])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || !businessNamespace || !conversationId) return

        const messageContent = inputValue.trim()
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: messageContent,
            sender: 'user',
            timestamp: new Date(),
            status: 'sending'
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)
        setIsTyping(true)
        setError(null)

        try {
            // Mark user message as sent
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: 'sent' }
                        : msg
                )
            )

            // Send message to Gemini AI via backend
            const response = await chatAPI.sendMessage({
                message: messageContent,
                business_namespace: businessNamespace,
                conversation_id: conversationId,
                session_id: sessionId,
                customer_id: chatAPI.generateCustomerId(),
                customer_email: user?.email,
                // Use user.name (matches UserProfile) with fallback to email
                customer_name: user?.name || user?.email,
                channel: 'web_chat'
            })

            if (response.success) {
                const botMessage: ChatMessage = {
                    id: response.message_id || (Date.now() + 1).toString(),
                    content: response.response,
                    sender: 'bot',
                    timestamp: new Date(),
                    status: 'sent',
                    confidence_score: response.confidence_score,
                    model_used: response.model_used
                }
                setMessages(prev => [...prev, botMessage])
            } else {
                throw new Error('Failed to get response from AI')
            }

        } catch (err) {
            console.error('Failed to send message:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
            setError(errorMessage)

            // Mark user message as error
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: 'error' }
                        : msg
                )
            )

            // Add error bot message
            const errorBotMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                content: botConfig?.fallback_message || "I apologize, but I'm having trouble processing your request right now. Please try again.",
                sender: 'bot',
                timestamp: new Date(),
                status: 'sent'
            }
            setMessages(prev => [...prev, errorBotMessage])

            toast.error(`Message Failed: ${errorMessage}`)
        } finally {
            setIsTyping(false)
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content)
        toast("Message copied to clipboard")
    }

    const resetChat = async () => {
        if (!businessNamespace) return

        try {
            setMessages([])
            setConversationId(null)
            setError(null)
            await initializeChat()
            toast("Started a new conversation")
        } catch (err) {
            console.error("Failed to reset chat:", err)
            toast(
                "Reset Failed"
            )
        }
    }

    const handleThumbsUp = (messageId: string) => {
        console.log("Thumbs up for message:", messageId)
        // TODO: Implement feedback to backend; use messageId so lint is happy
        toast(
            "Feedback Received"
        )
    }

    const handleThumbsDown = (messageId: string) => {
        console.log("Thumbs up for message:", messageId)
        // TODO: Implement feedback to backend; use messageId so lint is happy
        toast(
            "Feedback Received"

        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-full bg-black text-white rounded-lg border border-white/20 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black shrink-0">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="/api/placeholder/48/48" alt="AI Assistant" />
                        <AvatarFallback className="bg-white text-black">
                            <Bot className="h-6 w-6" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-semibold">AI Assistant</h2>
                        <p className="text-sm text-gray-400">
                            <span className="inline-flex items-center gap-2">
                                <span
                                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-600"}`}
                                />
                                {isConnected ? "Online" : "Offline"} • Powered by Traliq.ai
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black text-white border border-white/20">
                            <DropdownMenuItem className="hover:bg-white/10" onClick={resetChat}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/10">
                                <Settings className="mr-2 h-4 w-4" />
                                Bot Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* show error banner if error exists */}
            {error && (
                <div className="px-6 py-2 bg-red-700/20 text-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Messages */}
            <main className="flex-1 overflow-hidden min-h-0">
                <ScrollArea className="h-full px-6 py-6">
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Avatar className="h-8 w-8 mt-1">
                                    {message.sender === 'bot' ? (
                                        <AvatarFallback className="bg-white text-black">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-gray-700 text-white">
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <div className={`flex-1 max-w-[70%] ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                    <div className="group relative">
                                        <div
                                            className={`
                                                inline-block px-4 py-3 rounded-2xl text-sm
                                                transition-all duration-200
                                                ${message.sender === 'user'
                                                ? 'bg-white text-black'
                                                : 'bg-gray-900 text-white'
                                            }
                                            `}
                                        >
                                            {message.content}
                                            {message.status === 'sending' && (
                                                <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
                                            )}
                                        </div>

                                        {/* Message Actions */}
                                        <div className={`
                                            absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity
                                            ${message.sender === 'user' ? '-left-12' : '-right-12'}
                                        `}>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-white/10"
                                                    onClick={() => copyMessage(message.content)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                                {message.sender === 'bot' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-white/10"
                                                            onClick={() => handleThumbsUp(message.id)}
                                                        >
                                                            <ThumbsUp className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-white/10"
                                                            onClick={() => handleThumbsDown(message.id)}
                                                        >
                                                            <ThumbsDown className="h-3 w-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-xs text-gray-400 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex gap-4">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-white text-black">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="inline-block px-4 py-3 rounded-2xl bg-gray-900">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div ref={messagesEndRef} />
                </ScrollArea>
            </main>

            <Separator className="bg-white/20" />

            {/* Input */}
            <footer className="p-4 bg-black border-t border-white/20 shrink-0">
                <div className="flex gap-3 items-end">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 min-h-[44px] border border-white/20 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-white/40"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-11 px-4 bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Enter = send • Shift + Enter = new line</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-600"}`} />
                        <span>{isConnected ? "Connected" : "Disconnected"}</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Chat
