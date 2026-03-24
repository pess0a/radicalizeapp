'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const reviewSchema = z.object({
  orderId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function submitReview(input: {
  orderId: string
  rating: number
  comment?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) throw new Error('Dados inválidos')

  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: { activity: true },
  })

  if (!order) throw new Error('Pedido não encontrado')
  if (order.userId !== session.user.id) throw new Error('Não autorizado')
  if (order.status !== 'PAID') throw new Error('Apenas pedidos pagos podem ser avaliados')

  const existing = await db.review.findUnique({
    where: { orderId: input.orderId },
  })
  if (existing) throw new Error('Você já avaliou esta atividade')

  const review = await db.review.create({
    data: {
      orderId: input.orderId,
      userId: session.user.id,
      activityId: order.activityId,
      rating: input.rating,
      comment: input.comment,
    },
  })

  revalidatePath(`/atividades/${order.activity.slug}`)
  revalidatePath('/conta')
  return review
}

export async function getActivityReviews(activityId: string, page = 1) {
  const limit = 10
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { activityId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.review.count({ where: { activityId } }),
  ])

  return { reviews, total, pages: Math.ceil(total / limit) }
}
