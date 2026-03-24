'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(slotId: string, quantity: number) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout')
  }

  const slot = await db.activitySlot.findUnique({
    where: { id: slotId },
    include: {
      activity: {
        include: { images: { take: 1, orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!slot) throw new Error('Slot não encontrado')
  if (slot.status !== 'AVAILABLE') throw new Error('Slot indisponível')

  const availableSpots = slot.capacity - slot.bookedCount
  if (quantity > availableSpots) {
    throw new Error(`Apenas ${availableSpots} vaga(s) disponível(is)`)
  }

  const unitAmountCents = Math.round(Number(slot.activity.price) * 100)
  const totalAmountCents = unitAmountCents * quantity

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      activityId: slot.activityId,
      slotId,
      quantity,
      totalAmountCents,
      status: 'PENDING',
    },
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'brl',
    line_items: [
      {
        price_data: {
          currency: 'brl',
          unit_amount: unitAmountCents,
          product_data: {
            name: slot.activity.name,
            description: `${quantity} vaga(s) — ${new Date(slot.startTime).toLocaleDateString('pt-BR')}`,
            images: slot.activity.images[0]
              ? [slot.activity.images[0].url]
              : [],
          },
        },
        quantity,
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${process.env.NEXT_PUBLIC_URL}/conta?order=${order.id}&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/atividades/${slot.activity.slug}?cancelled=true`,
  })

  await db.order.update({
    where: { id: order.id },
    data: { stripeCheckoutId: checkoutSession.id },
  })

  redirect(checkoutSession.url!)
}

export async function getUserOrders() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  return db.order.findMany({
    where: { userId: session.user.id },
    include: {
      activity: {
        include: { images: { take: 1, orderBy: { order: 'asc' } } },
      },
      slot: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOperatorOrders() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const operator = await db.operatorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!operator) throw new Error('Perfil de operador não encontrado')

  return db.order.findMany({
    where: { activity: { operatorId: operator.id } },
    include: {
      activity: { select: { id: true, name: true, slug: true } },
      slot: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}
