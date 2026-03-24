import { notFound } from 'next/navigation'
import { getActivityBySlug } from '@/actions/activity.actions'
import { auth } from '@/lib/auth'
import { getUserOrders } from '@/actions/checkout.actions'
import { ActivityGallery } from '@/components/activities/ActivityGallery'
import { BookingPanel } from '@/components/checkout/BookingPanel'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { StarRating } from '@/components/reviews/StarRating'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const activity = await getActivityBySlug(slug)
  if (!activity) return { title: 'Atividade não encontrada' }

  return {
    title: activity.name,
    description: activity.description.slice(0, 160),
    openGraph: {
      images: activity.images[0] ? [{ url: activity.images[0].url }] : [],
    },
  }
}

const difficultyLabel: Record<string, string> = {
  EASY: 'Fácil',
  MODERATE: 'Moderado',
  HARD: 'Difícil',
  EXTREME: 'Extremo',
}

export default async function ActivityDetailPage({ params }: Props) {
  const { slug } = await params
  const [activity, session] = await Promise.all([
    getActivityBySlug(slug),
    auth(),
  ])

  if (!activity) notFound()

  let userOrders: Awaited<ReturnType<typeof getUserOrders>> = []
  if (session?.user?.id) {
    userOrders = await getUserOrders()
  }

  const paidOrderForActivity = userOrders.find(
    (o) => o.activityId === activity.id && o.status === 'PAID' && !o.review
  )

  const hours = Math.floor(activity.durationMinutes / 60)
  const mins = activity.durationMinutes % 60
  const durationStr = hours > 0 ? `${hours}h${mins > 0 ? `${mins}min` : ''}` : `${mins}min`

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-900">Início</Link>
          <ChevronRight size={14} />
          <Link href="/" className="hover:text-gray-900">{activity.category.name}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{activity.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityGallery images={activity.images} name={activity.name} />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{activity.category.name}</Badge>
                <Badge variant="outline">{difficultyLabel[activity.difficulty]}</Badge>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">{activity.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {activity.city}, {activity.state}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {durationStr}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {activity.minParticipants}–{activity.maxParticipants} participantes
                </div>
              </div>

              {activity.averageRating != null && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating value={Math.round(activity.averageRating)} size="md" />
                  <span className="text-sm font-medium">{activity.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">
                    ({activity._count?.reviews ?? activity.reviews.length} avaliações)
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-3">Sobre a atividade</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {activity.description}
              </p>
            </div>

            {activity.requirements && (
              <div className="border-t pt-6">
                <h2 className="font-semibold text-lg mb-3">Requisitos</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{activity.requirements}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-3">Operador</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {activity.operator.companyName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{activity.operator.companyName}</p>
                  {activity.operator.description && (
                    <p className="text-sm text-gray-500">{activity.operator.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <ReviewList
                reviews={activity.reviews.map((r) => ({
                  id: r.id,
                  rating: r.rating,
                  comment: r.comment,
                  createdAt: r.createdAt.toISOString(),
                  user: r.user,
                }))}
                total={activity._count?.reviews ?? activity.reviews.length}
                activityId={activity.id}
              />

              {paidOrderForActivity && (
                <div className="mt-6">
                  <ReviewForm orderId={paidOrderForActivity.id} />
                </div>
              )}
            </div>
          </div>

          {/* Booking panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BookingPanel
                activityId={activity.id}
                price={activity.price}
                slots={activity.slots.map((s) => ({
                  id: s.id,
                  startTime: s.startTime.toISOString(),
                  endTime: s.endTime.toISOString(),
                  capacity: s.capacity,
                  bookedCount: s.bookedCount,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
