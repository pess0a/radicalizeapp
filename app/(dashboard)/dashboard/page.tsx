export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getOperatorActivities } from '@/actions/activity.actions'
import { getOperatorOrders } from '@/actions/checkout.actions'
import { getOrCreateOperatorProfile } from '@/actions/operator.actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, ShoppingBag, Star } from 'lucide-react'
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

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [activities, orders] = await Promise.all([
    getOperatorActivities(),
    getOperatorOrders(),
    getOrCreateOperatorProfile(),
  ])

  const paidOrders = orders.filter((o) => o.status === 'PAID')
  const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmountCents / 100, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button render={<Link href="/dashboard/atividades/nova" />}>
            <Plus size={16} className="mr-2" />
            Nova atividade
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin size={14} /> Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activities.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {activities.filter((a) => a.isPublished).length} publicadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <ShoppingBag size={14} /> Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {paidOrders.length} pagos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Star size={14} /> Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">total recebido</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pedidos recentes</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/pedidos" />}>
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhum pedido ainda
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.activity.name}</p>
                      <p className="text-xs text-gray-500">
                        {order.user.name} · {new Date(order.slot.startTime).toLocaleDateString('pt-BR')}
                        {' · '}{order.quantity} vaga{order.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        R$ {(order.totalAmountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                      <Badge className={`text-xs border-0 ${statusColor[order.status]}`}>
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
