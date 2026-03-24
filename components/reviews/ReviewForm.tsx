'use client'

import { useState } from 'react'
import { StarRating } from './StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitReview } from '@/actions/review.actions'
import { toast } from 'sonner'

interface ReviewFormProps {
  orderId: string
}

export function ReviewForm({ orderId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (rating === 0) {
      toast.error('Selecione uma nota de 1 a 5')
      return
    }

    setLoading(true)
    try {
      await submitReview({ orderId, rating, comment: comment || undefined })
      toast.success('Avaliação enviada com sucesso!')
      setSubmitted(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar avaliação')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-800 font-medium">Obrigado pela sua avaliação!</p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Avalie sua experiência</h3>
      <StarRating
        value={rating}
        interactive
        onChange={setRating}
        size="lg"
        className="mb-3"
      />
      <Textarea
        placeholder="Compartilhe como foi a experiência (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="mb-3 bg-white"
      />
      <Button onClick={handleSubmit} disabled={loading || rating === 0}>
        {loading ? 'Enviando...' : 'Enviar avaliação'}
      </Button>
    </div>
  )
}
