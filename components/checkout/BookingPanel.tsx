'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/actions/checkout.actions'
import { toast } from 'sonner'
import { Calendar, Users, AlertCircle } from 'lucide-react'

interface Slot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
}

interface BookingPanelProps {
  activityId: string
  price: number
  slots: Slot[]
}

export function BookingPanel({ price, slots }: BookingPanelProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const selectedSlot = slots.find((s) => s.id === selectedSlotId)
  const available = selectedSlot ? selectedSlot.capacity - selectedSlot.bookedCount : 0
  const total = price * quantity

  async function handleBook() {
    if (!selectedSlotId) {
      toast.error('Selecione um horário')
      return
    }

    if (!session) {
      router.push('/login?callbackUrl=' + window.location.pathname)
      return
    }

    setLoading(true)
    try {
      await createCheckoutSession(selectedSlotId, quantity)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao iniciar compra')
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl font-bold text-gray-900">
          R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </span>
        <span className="text-gray-500 text-sm">por pessoa</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={14} />
            Escolha um horário
          </label>

          {slots.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <AlertCircle size={14} />
              Sem horários disponíveis
            </div>
          ) : (
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {slots.map((slot) => {
                const spots = slot.capacity - slot.bookedCount
                const date = new Date(slot.startTime)
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlotId(slot.id)
                      setQuantity(1)
                    }}
                    disabled={spots === 0}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      selectedSlotId === slot.id
                        ? 'border-blue-500 bg-blue-50'
                        : spots === 0
                        ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">
                      {date.toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })}
                      {' — '}
                      {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {spots > 0 ? `${spots} vaga${spots > 1 ? 's' : ''} disponível` : 'Esgotado'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {selectedSlot && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users size={14} />
              Quantidade
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium"
              >
                −
              </button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                disabled={quantity >= available}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        {selectedSlot && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-gray-900">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleBook}
          disabled={loading || slots.length === 0}
        >
          {loading
            ? 'Aguarde...'
            : !session
            ? 'Entrar para comprar'
            : 'Reservar agora'}
        </Button>

        {!session && (
          <p className="text-xs text-center text-gray-500">
            Você será redirecionado para login
          </p>
        )}
      </div>
    </div>
  )
}
