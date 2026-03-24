'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getOrCreateOperatorProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const existing = await db.operatorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  })

  if (existing) return existing

  const profile = await db.operatorProfile.create({
    data: {
      userId: session.user.id,
      companyName: session.user.name ?? 'Minha Empresa',
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  })

  await db.user.update({
    where: { id: session.user.id },
    data: { role: 'OPERATOR' },
  })

  return profile
}

export async function updateOperatorProfile(data: {
  companyName?: string
  cnpj?: string
  description?: string
  logoUrl?: string
  website?: string
  instagramHandle?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const profile = await db.operatorProfile.update({
    where: { userId: session.user.id },
    data,
  })

  revalidatePath('/dashboard')
  return profile
}

export async function getCategories() {
  return db.category.findMany({
    include: {
      templates: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function addActivitySlot(
  activityId: string,
  slot: { startTime: Date; endTime: Date; capacity: number }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  await db.activity.findFirstOrThrow({
    where: { id: activityId, operator: { userId: session.user.id } },
  })

  return db.activitySlot.create({
    data: { activityId, ...slot },
  })
}
