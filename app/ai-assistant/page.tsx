"use client"

import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react"
import { Bot, ChefHat, Clock3, Loader2, Send, Sparkles, UserRound, WandSparkles } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { renderAssistantMessage } from "@/utils/ai-md"

type ChatMessage = {
    id: string
    role: "user" | "assistant"
    content: string
}

type ApiChatMessage = Pick<ChatMessage, "role" | "content">

const starterPrompts = [
    "What can I cook with chicken, rice, and yogurt?",
    "Make a 20 minute dinner plan for two people.",
    "How do I rescue soup that became too salty?",
    "Create a high protein vegetarian meal prep menu.",
]

const welcomeMessage: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
        "Hi, I am your RecipeVerse assistant. Ask for recipe ideas, substitutions, cooking fixes, meal plans, or help turning ingredients into dinner.",
}


const Page = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    async function askAI(userMessage: string, history: ApiChatMessage[]) {
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userMessage, history }),
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error || "The assistant could not respond.")
        }

        return data.reply as string
    }

    const submitMessage = async (content: string) => {
        const trimmedMessage = content.trim()

        if (!trimmedMessage || isSending) return

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmedMessage,
        }

        const nextMessages = [...messages, userMessage]
        const recentHistory = nextMessages
            .filter((chatMessage) => chatMessage.id !== welcomeMessage.id)
            .slice(-10)
            .map(({ role, content }) => ({ role, content }))

        setMessages(nextMessages)
        setMessage("")
        setError("")
        setIsSending(true)

        try {
            const reply = await askAI(trimmedMessage, recentHistory)
            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: reply,
                },
            ])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.")
        } finally {
            setIsSending(false)
        }
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        submitMessage(message)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            submitMessage(message)
        }
    }

    useEffect(() => {
        if (isSending) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [isSending])

    return (
        <main className="flex h-[calc(100vh-8rem)] flex-col bg-background px-4 pb-20 pt-20 text-primary-text md:px-10 md:pb-10 md:pt-0">
            <section className="grid flex-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] pb-20 sm:pb-0">
                <aside className="hidden h-[calc(100vh-7rem)] overflow-auto rounded-md border border-secondary-text/10 bg-white shadow-sm lg:block scrollbar-none">
                    <div className="relative h-44">
                        <Image src="/ai.jpg" alt="RecipeVerse AI assistant" fill className="object-cover" priority />
                        <div className="absolute inset-0 bg-primary-text/35" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <Badge className="mb-3 bg-white/90 text-primary-text">
                                <Sparkles size={13} />
                                AI kitchen guide
                            </Badge>
                            <h1 className="text-2xl font-bold leading-tight">Cook with sharper answers.</h1>
                        </div>
                    </div>

                    <div className="space-y-5 p-5">
                        <div>
                            <p className="text-sm font-semibold text-primary-text">Best for</p>
                            <div className="mt-3 grid gap-3 text-sm text-secondary-text">
                                <div className="flex items-start gap-3">
                                    <ChefHat className="mt-0.5 size-4 text-primary" />
                                    Recipe ideas from what you already have
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock3 className="mt-0.5 size-4 text-secondary" />
                                    Fast meal plans and prep timelines
                                </div>
                                <div className="flex items-start gap-3">
                                    <WandSparkles className="mt-0.5 size-4 text-primary" />
                                    Substitutions, fixes, and flavor upgrades
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-primary-text">Try a prompt</p>
                            <div className="mt-3 grid gap-2">
                                {starterPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => submitMessage(prompt)}
                                        disabled={isSending}
                                        className="rounded-md border border-secondary-text/10 bg-background px-3 py-2 text-left text-sm text-secondary-text transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-md border border-secondary-text/10 bg-white shadow-sm md:min-h-[calc(100vh-7rem)]">
                    <header className="flex items-center justify-between gap-4 border-b border-secondary-text/10 px-4 py-4 md:px-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-white">
                                    <Bot size={19} />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="truncate text-lg font-bold text-primary-text">AI Assistant</h2>
                                    <p className="truncate text-sm text-secondary-text">Recipe help, meal planning, and kitchen troubleshooting</p>
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="hidden border-primary/30 text-primary md:inline-flex">
                            Online
                        </Badge>
                    </header>

                    <div className="flex-1 overflow-y-auto bg-background/70 px-3 py-4 md:px-6">
                        <div className="mx-auto flex max-w-4xl flex-col gap-4">
                            {messages.map((chatMessage) => {
                                const isUser = chatMessage.role === "user"

                                return (
                                    <div key={chatMessage.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                                        {!isUser && (
                                            <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                                                <Bot size={17} />
                                            </span>
                                        )}
                                        <div
                                            className={`max-w-[82%] rounded-md px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[72%] ${isUser
                                                ? "bg-primary text-white"
                                                : "border border-secondary-text/10 bg-white text-primary-text"
                                                }`}
                                        >
                                            {isUser ? <span className="whitespace-pre-wrap">{chatMessage.content}</span> : renderAssistantMessage(chatMessage.content)}
                                        </div>
                                        {isUser && (
                                            <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-white">
                                                <UserRound size={17} />
                                            </span>
                                        )}
                                    </div>
                                )
                            })}

                            {isSending && (
                                <div className="flex justify-start gap-3">
                                    <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                                        <Bot size={17} />
                                    </span>
                                    <div className="flex items-center gap-2 rounded-md border border-secondary-text/10 bg-white px-4 py-3 text-sm text-secondary-text shadow-sm">
                                        <Loader2 className="size-4 animate-spin text-primary" />
                                        Thinking through the recipe...
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </div>

                    <div className="border-t border-secondary-text/10 bg-white p-3 md:p-5">
                        {error && (
                            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-end gap-2">
                            <Textarea
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    isMobile
                                        ? "Ask for recipes or meal plans..."
                                        : "Ask for recipes, substitutions, meal plans, or cooking fixes..."
                                }
                                className="max-h-40 min-h-12 resize-none rounded-md border-secondary-text/20 bg-background px-4 py-3 text-sm focus-visible:border-primary focus-visible:ring-primary/20"
                                disabled={isSending}
                            />
                            <Button
                                type="submit"
                                size="icon-lg"
                                className="h-12 w-12 rounded-md bg-primary text-white hover:bg-primary/85"
                                disabled={isSending || !message.trim()}
                                aria-label="Send message"
                            >
                                {isSending ? <Loader2 className="animate-spin" /> : <Send />}
                            </Button>
                        </form>
                        <p className="hidden md:block mx-auto mt-2 max-w-4xl text-xs text-secondary-text">
                            Press Enter to send. Use Shift + Enter for a new line.
                        </p>
                    </div>
                </section>
            </section>
        </main>
    )
}

export default Page
