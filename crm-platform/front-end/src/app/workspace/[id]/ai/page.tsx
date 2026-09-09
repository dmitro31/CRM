'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AxiosError } from 'axios'
import { Sparkles, Send } from 'lucide-react'

import { ProtectedRoute } from '@/components/protected-route'
import { Card } from '@/shared/UI/Card'
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
      let message = 'Не вдалося отримати відповідь.'
      if (err instanceof AxiosError) {
        message =
          err.response?.status === 503
            ? 'AI зараз перевантажений, спробуй ще раз за хвилину.'
            : ((err.response?.data as { message?: string })?.message ?? message)
      }
      setMessages(prev => [...prev, { role: 'assistant', text: message }])
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-8 py-10">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-[#24493B]" />
        <h1 className="text-[20px] font-medium text-[#171A18]">AI Асистент</h1>
      </div>

      <Card padded={false} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-[13px] text-[#8B9088]">
            Запитай про дані свого workspace, наприклад: &quot;скільки записів у статусі Новий?&quot;
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-[13px] ${
              message.role === 'user'
                ? 'ml-auto bg-[#24493B] text-white'
                : 'bg-[#F6F7F4] text-[#171A18]'
            }`}
          >
            {message.text}
          </div>
        ))}

        {isAsking && (
          <div className="max-w-[80%] rounded-lg bg-[#F6F7F4] px-3 py-2 text-[13px] text-[#8B9088]">
            Думаю...
          </div>
        )}

        <div ref={bottomRef} />
      </Card>

      <div className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void handleAsk() }}
          placeholder="Напиши питання..."
          className="flex-1 rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] focus:border-[#24493B]/40 focus:outline-none"
        />
        <button
          onClick={() => void handleAsk()}
          disabled={isAsking}
          className="flex items-center justify-center rounded-md bg-[#24493B] px-4 py-2 text-white transition-colors hover:bg-[#1B392E] disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}