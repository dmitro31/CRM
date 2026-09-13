'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import * as aiApi from '@/lib/ai-api'

interface LocalMessage {
  role: 'user' | 'assistant'
  text: string
}

export default function AiAssistantPage() {
  return (
    <ProtectedRoute>
      <AiAssistantContent />
    </ProtectedRoute>
  )
}

function AiAssistantContent() {
  const { id: workspaceId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['ai-conversations', workspaceId],
    queryFn: () => aiApi.getConversations(workspaceId),
  })

  const { data: loadedMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['ai-conversation-messages', workspaceId, selectedConversationId],
    queryFn: () => aiApi.getConversationMessages(workspaceId, selectedConversationId!),
    enabled: !!selectedConversationId,
  })

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }
    if (loadedMessages) {
      setMessages(
        loadedMessages.map(m => ({
          role: m.role === 'USER' ? 'user' : 'assistant',
          text: m.content,
        })),
      )
    }
  }, [selectedConversationId, loadedMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAsking])

  const handleNewChat = () => {
    setSelectedConversationId(null)
    setMessages([])
    setError(null)
    textareaRef.current?.focus()
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Видалити цю розмову?')) return

    await aiApi.deleteConversation(workspaceId, conversationId)
    void queryClient.invalidateQueries({ queryKey: ['ai-conversations', workspaceId] })

    if (selectedConversationId === conversationId) {
      handleNewChat()
    }
  }

  const handleAsk = async () => {
    const trimmed = question.trim()
    if (!trimmed || isAsking) return

    setError(null)
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setQuestion('')
    setIsAsking(true)

    try {
      const { answer, conversationId } = await aiApi.askAssistant(
        workspaceId,
        trimmed,
        selectedConversationId ?? undefined,
      )

      setMessages(prev => [...prev, { role: 'assistant', text: answer }])

      if (!selectedConversationId) {
        setSelectedConversationId(conversationId)
      }

      void queryClient.invalidateQueries({ queryKey: ['ai-conversations', workspaceId] })
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setError(message ?? 'Не вдалося отримати відповідь')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsAsking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleAsk()
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl gap-4 p-8">
      <aside className="flex w-64 shrink-0 flex-col rounded-lg border bg-white">
        <div className="border-b p-3">
          <button
            onClick={handleNewChat}
            className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Нова розмова
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingConversations && (
            <p className="p-2 text-sm text-gray-400">Завантаження...</p>
          )}

          {!isLoadingConversations && conversations.length === 0 && (
            <p className="p-2 text-sm text-gray-400">Історія порожня.</p>
          )}

          <div className="space-y-1">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`group flex items-center justify-between rounded px-2 py-2 text-sm ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className="flex-1 truncate text-left"
                  title={conversation.title}
                >
                  {conversation.title}
                </button>
                <button
                  onClick={() => void handleDeleteConversation(conversation.id)}
                  className="ml-2 shrink-0 text-gray-300 opacity-0 hover:text-red-600 group-hover:opacity-100"
                  title="Видалити"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <h1 className="mb-4 text-2xl font-semibold">AI Асистент</h1>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border bg-white p-4">
          {messages.length === 0 && !isLoadingMessages && (
            <p className="text-gray-400">
              Запитай про дані свого workspace, наприклад: &quot;скільки записів у
              статусі Новий?&quot;
            </p>
          )}

          {isLoadingMessages && (
            <p className="text-gray-400">Завантаження розмови...</p>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'ml-auto bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.text}
            </div>
          ))}

          {isAsking && (
            <div className="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
              Думаю...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напиши питання... (Enter — надіслати, Shift+Enter — новий рядок)"
            rows={2}
            className="flex-1 resize-none rounded border px-3 py-2"
          />
          <button
            onClick={() => void handleAsk()}
            disabled={isAsking || !question.trim()}
            className="self-end rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Надіслати
          </button>
        </div>
      </div>
    </div>
  )
}