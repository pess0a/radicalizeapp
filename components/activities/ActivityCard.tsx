'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/reviews/StarRating'
import { useMapStore } from '@/store/mapStore'
import { cn } from '@/lib/utils'

interface ActivityCardProps {
  id: string
  slug: string
  name: string
  city: string
  state: string
  price: number
  durationMinutes: number
  difficulty: string
  imageUrl?: string
  averageRating?: number | null
  reviewCount?: number
  categoryName?: string
}

const difficultyLabel: Record<string, string> = {
  EASY: 'Fácil',
  MODERATE: 'Moderado',
  HARD: 'Difícil',
  EXTREME: 'Extremo',
}

const difficultyColor: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  EXTREME: 'bg-red-100 text-red-800',
}

export function ActivityCard({
  id,
  slug,
  name,
  city,
  state,
  price,
  durationMinutes,
  difficulty,
  imageUrl,
  averageRating,
  reviewCount,
  categoryName,
}: ActivityCardProps) {
  const setHovered = useMapStore((s) => s.setHovered)
  const hoveredId = useMapStore((s) => s.hoveredActivityId)
  const isHovered = hoveredId === id

  const hours = Math.floor(durationMinutes / 60)
  const mins = durationMinutes % 60
  const durationStr = hours > 0 ? `${hours}h${mins > 0 ? `${mins}min` : ''}` : `${mins}min`

  return (
    <Link href={`/atividades/${slug}`}>
      <div
        className={cn(
          'flex gap-3 p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer',
          isHovered && 'border-blue-400 bg-blue-50'
        )}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
              🏄
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900 truncate">{name}</h3>
            <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
              R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500 truncate">{city}, {state}</span>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {categoryName && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {categoryName}
              </Badge>
            )}
            <Badge className={cn('text-xs px-1.5 py-0 border-0', difficultyColor[difficulty])}>
              {difficultyLabel[difficulty] ?? difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} />
              {durationStr}
            </div>
          </div>

          {averageRating != null && (
            <div className="flex items-center gap-1 mt-1.5">
              <StarRating value={Math.round(averageRating)} size="sm" />
              <span className="text-xs text-gray-500">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
