import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const order = await db.order.findUnique({
      where: { stripeCheckoutId: session.id },
    })

    if (!order) {
      return new Response('Order not found', { status: 404 })
    }

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          confirmedAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
        },
      }),
      db.activitySlot.update({
        where: { id: order.slotId },
        data: { bookedCount: { increment: order.quantity } },
      }),
    ])
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session

    await db.order.updateMany({
      where: { stripeCheckoutId: session.id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    })
  }

  return new Response('OK', { status: 200 })
}
