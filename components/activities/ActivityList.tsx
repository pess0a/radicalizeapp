'use client'

import { useEffect, useRef, useState } from 'react'
import { useMapStore } from '@/store/mapStore'
import { ActivityCard } from './ActivityCard'
import { Loader2 } from 'lucide-react'

interface Activity {
  id: string
  slug: string
  name: string
  city: string
  state: string
  price: number
  durationMinutes: number
  difficulty: string
  images: { url: string }[]
  averageRating?: number | null
  reviewCount?: number
  category?: { name: string }
}

interface ActivityListProps {
  initialActivities: Activity[]
}

export function ActivityList({ initialActivities }: ActivityListProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [loading, setLoading] = useState(false)
  const bounds = useMapStore((s) => s.bounds)
  const prevBoundsRef = useRef<typeof bounds>(null)

  useEffect(() => {
    if (!bounds) return
    if (JSON.stringify(bounds) === JSON.stringify(prevBoundsRef.current)) return
    prevBoundsRef.current = bounds

    setLoading(true)

    const params = new URLSearchParams({
      swLat: String(bounds.swLat),
      swLng: String(bounds.swLng),
      neLat: String(bounds.neLat),
      neLng: String(bounds.neLng),
    })

    fetch(`/api/activities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setActivities(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [bounds])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {activities.length} atividade{activities.length !== 1 ? 's' : ''}
        </span>
        {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <span className="text-4xl mb-2">🏄</span>
            <p className="text-sm">Nenhuma atividade nesta área</p>
          </div>
        )}
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            id={activity.id}
            slug={activity.slug}
            name={activity.name}
            city={activity.city}
            state={activity.state}
            price={activity.price}
            durationMinutes={activity.durationMinutes}
            difficulty={activity.difficulty}
            imageUrl={activity.images[0]?.url}
            averageRating={activity.averageRating}
            reviewCount={activity.reviewCount}
            categoryName={activity.category?.name}
          />
        ))}
      </div>
    </div>
  )
}
