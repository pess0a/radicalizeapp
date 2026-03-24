export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserOrders } from '@/actions/checkout.actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/reviews/StarRating'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'

const statusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDED: 'bg-red-100 text-red-800',
}

export default async function ContaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const orders = await getUserOrders()

  const pendingReviews = orders.filter(
    (o) => o.status === 'PAID' && !o.review && new Date(o.slot.startTime) <= new Date()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Minha Conta</h1>

        {pendingReviews.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="font-semibold text-lg">Avalie sua experiência</h2>
            {pendingReviews.map((order) => (
              <Card key={order.id} className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-3">{order.activity.name}</p>
                  <ReviewForm orderId={order.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meus pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Você ainda não fez nenhum pedido</p>
                <Link
                  href="/"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Explorar atividades
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex gap-4 py-4 border-b last:border-0">
                    <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {order.activity.images[0]?.url ? (
                        <Image
                          src={order.activity.images[0].url}
                          alt={order.activity.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏄</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/atividades/${order.activity.slug}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {order.activity.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.slot.startTime).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {' · '}
                        {order.quantity} vaga{order.quantity > 1 ? 's' : ''}
                      </p>

                      {order.review && (
                        <div className="mt-1.5">
                          <StarRating value={order.review.rating} size="sm" />
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">
                        R$ {(order.totalAmountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </p>
                      <Badge className={`text-xs border-0 mt-1 ${statusColor[order.status]}`}>
                        {statusLabel[order.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
