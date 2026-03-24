export const dynamic = 'force-dynamic'

import { getActivities } from '@/actions/activity.actions'
import { ActivityList } from '@/components/activities/ActivityList'
import { MapView } from '@/components/map/MapView'
import { MapProvider } from '@/components/providers/MapProvider'
import { Navbar } from '@/components/Navbar'

export default async function Home() {
  const { activities } = await getActivities({ limit: 20 })

  const serialized = activities.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    city: a.city,
    state: a.state,
    price: a.price,
    durationMinutes: a.durationMinutes,
    difficulty: a.difficulty as string,
    images: a.images.map((img) => ({ url: img.url })),
    averageRating: a.averageRating,
    reviewCount: a.reviewCount,
    category: a.category ? { name: a.category.name } : undefined,
  }))

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[420px] flex-shrink-0 border-r border-gray-200 overflow-hidden flex flex-col">
          <ActivityList initialActivities={serialized} />
        </div>

        {/* Right panel — map */}
        <div className="flex-1 relative">
          <MapProvider>
            <MapView />
          </MapProvider>
        </div>
      </div>
    </div>
  )
}
