import { ReactNode } from "react"

const renderInlineMarkdown = (text: string): ReactNode[] => {
    const nodes: ReactNode[] = []
    const inlinePattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let lastIndex = 0

    text.replace(inlinePattern, (match, _token, index) => {
        if (index > lastIndex) {
            nodes.push(text.slice(lastIndex, index))
        }

        if (match.startsWith("**")) {
            nodes.push(<strong key={`${index}-${match}`}>{match.slice(2, -2)}</strong>)
        } else {
            nodes.push(<em key={`${index}-${match}`}>{match.slice(1, -1)}</em>)
        }

        lastIndex = index + match.length
        return match
    })

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex))
    }

    return nodes
}

export const renderAssistantMessage = (content: string) => {
    const lines = content.split("\n")
    const elements: ReactNode[] = []
    let listItems: ReactNode[] = []
    let listType: "ul" | "ol" | null = null

    const flushList = () => {
        if (!listType || listItems.length === 0) return

        const ListTag = listType
        elements.push(
            <ListTag key={`list-${elements.length}`} className={`my-2 space-y-1 pl-5 ${listType === "ul" ? "list-disc" : "list-decimal"}`}>
                {listItems}
            </ListTag>
        )
        listItems = []
        listType = null
    }

    lines.forEach((line, index) => {
        const trimmedLine = line.trim()

        if (!trimmedLine) {
            flushList()
            return
        }

        const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/)
        const unorderedMatch = trimmedLine.match(/^[-*]\s+(.+)$/)
        const orderedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/)

        if (headingMatch) {
            flushList()
            const HeadingTag = headingMatch[1].length === 1 ? "h3" : "h4"

            elements.push(
                <HeadingTag key={`heading-${index}`} className="mt-3 font-semibold leading-6 text-primary-text first:mt-0">
                    {renderInlineMarkdown(headingMatch[2])}
                </HeadingTag>
            )
            return
        }

        if (unorderedMatch || orderedMatch) {
            const nextListType = unorderedMatch ? "ul" : "ol"

            if (listType && listType !== nextListType) {
                flushList()
            }

            listType = nextListType
            listItems.push(
                <li key={`item-${index}`} className="pl-1">
                    {renderInlineMarkdown((unorderedMatch?.[1] || orderedMatch?.[1] || "").trim())}
                </li>
            )
            return
        }

        flushList()
        elements.push(
            <p key={`paragraph-${index}`} className="my-2 first:mt-0 last:mb-0">
                {renderInlineMarkdown(trimmedLine)}
            </p>
        )
    })

    flushList()

    return elements
}