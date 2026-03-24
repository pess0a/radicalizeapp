'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  interactive?: boolean
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  className,
}: StarRatingProps) {
  const sizeMap = { sm: 14, md: 18, lg: 24 }
  const px = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          width={px}
          height={px}
          className={cn(
            'transition-colors',
            i < value ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300',
            interactive && 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400'
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  )
}
