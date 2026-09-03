'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import * as aiApi from '@/lib/ai-api'

interface ChatMessage {
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAsk = async () => {
    const trimmed = question.trim()
    if (!trimmed || isAsking) return

    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setQuestion('')
    setIsAsking(true)

    try {
      const { answer } = await aiApi.askAssistant(workspaceId, trimmed)
      setMessages(prev => [...prev, { role: 'assistant', text: answer }])
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: message ?? 'Не вдалося отримати відповідь.' },
      ])
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col p-8">
      <h1 className="mb-4 text-2xl font-semibold">AI Асистент</h1>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border bg-white p-4">
        {messages.length === 0 && (
          <p className="text-gray-400">
            Запитай про дані свого workspace, наприклад: &quot;скільки записів у
            статусі Новий?&quot;
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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

      <div className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') void handleAsk()
          }}
          placeholder="Напиши питання..."
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={() => void handleAsk()}
          disabled={isAsking}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Надіслати
        </button>
      </div>
    </div>
  )
}