"use client"

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import { Bot, Loader2, Send, Sparkles, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { renderAssistantMessage } from "@/utils/ai-md"
import { RecipeType } from "@/types/recipe"

type ChatMessage = {
    id: string
    role: "user" | "assistant"
    content: string
}

type ApiChatMessage = Pick<ChatMessage, "role" | "content">


const welcomeMessage: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
        "Hi, I am your RecipeVerse assistant. Ask for recipe ideas, substitutions, cooking fixes, meal plans, or help turning ingredients into dinner.",
}

function stringifyRecipe(recipe: RecipeType) {
    const ingredients = JSON.parse(recipe.ingredients);
    const preparation_steps = JSON.parse(recipe.preparation_steps);

    return `
    Title: ${recipe.title};
    Description: ${recipe.description};
    Prep Time: ${recipe.preparation_time} minutes;
    Cook Time: ${recipe.cooking_time} minutes;
    Servings: ${recipe.servings} people;
    Cuisine: ${recipe.cuisine};
    Tags: ${recipe.tags};
    Difficulty: ${recipe.difficulty};
    Author: ${recipe.profiles?.name || 'Unknown'};
    Ingredients: ${ingredients.map(({ name, quantity, unit }: any) => `${name} - ${quantity} ${unit}`).join(", ")};
    Instructions: ${preparation_steps.map(({ stepNumber, title, description }: any) => `${stepNumber}. ${title} - ${description}`).join(", ")}
    `
}

const AskAI = ({ recipe }: { recipe: RecipeType }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    const [isBotOpen, setIsBotOpen] = useState(false)


    async function askAI(userMessage: string, history: ApiChatMessage[]) {
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userMessage, history, context: stringifyRecipe(recipe) }),
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

    const handleBotToggle = () => {
        setIsBotOpen(!isBotOpen)
    }


    return (
        <div className="">
            {!isBotOpen && <Button onClick={handleBotToggle} className="rounded-full flex items-center gap-2 w-fit h-14 fixed bottom-20 md:bottom-10 right-5 md:right-10 bg-primary hover:bg-primary/80 z-50 px-5 cursor-pointer">
                <Sparkles className='h-7 w-7 text-white' /> Ask AI
            </Button>}
            {isBotOpen && <div className="fixed flex right-5 md:right-10 bottom-20 md:bottom-10 h-[calc(100vh-10rem)] flex-col text-primary-text">

                <section className="flex h-full flex-col overflow-hidden rounded-md border border-secondary-text/10 bg-white shadow-sm w-[340px] md:w-[400px]">
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
                        <Button onClick={handleBotToggle} variant="outline" className="text-red-500 border-red-500 hover:text-white hover:bg-red-500">
                            <X size={17} />
                        </Button>
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
                                placeholder="Ask about this recipe"
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

            </div>}
        </div>
    )
}

export default AskAI
