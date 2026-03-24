'use client'

import { StarRating } from './StarRating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

interface ReviewListProps {
  reviews: Review[]
  total: number
  activityId: string
}

export function ReviewList({ reviews, total }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div>
        <h2 className="font-semibold text-lg mb-3">Avaliações</h2>
        <p className="text-gray-500 text-sm">Ainda não há avaliações para esta atividade.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">
        Avaliações{' '}
        <span className="text-gray-400 font-normal text-base">({total})</span>
      </h2>

      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={review.user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {review.user.name?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{review.user.name ?? 'Usuário'}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <StarRating value={review.rating} size="sm" className="mt-1" />
              {review.comment && (
                <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{review.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
