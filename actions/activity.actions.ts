'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import slugify from 'slugify'
import type { Difficulty } from '@prisma/client'

export async function getActivities(filters?: {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  difficulty?: string
  page?: number
  limit?: number
}) {
  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 20
  const skip = (page - 1) * limit

  const where = {
    isPublished: true,
    ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters?.difficulty ? { difficulty: filters.difficulty as Difficulty } : {}),
    ...(filters?.minPrice || filters?.maxPrice
      ? {
          price: {
            ...(filters?.minPrice ? { gte: filters.minPrice } : {}),
            ...(filters?.maxPrice ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  }

  const [activities, total] = await Promise.all([
    db.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    db.activity.count({ where }),
  ])

  return {
    activities: activities.map((a) => ({
      ...a,
      price: Number(a.price),
      averageRating:
        a.reviews.length > 0
          ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
          : null,
      reviewCount: a._count.reviews,
    })),
    total,
    pages: Math.ceil(total / limit),
  }
}

export async function getActivityBySlug(slug: string) {
  const activity = await db.activity.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: true,
      template: true,
      operator: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      slots: {
        where: {
          startTime: { gte: new Date() },
          status: 'AVAILABLE',
        },
        orderBy: { startTime: 'asc' },
        take: 20,
      },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!activity) return null

  const averageRating =
    activity.reviews.length > 0
      ? activity.reviews.reduce((sum, r) => sum + r.rating, 0) /
        activity.reviews.length
      : null

  return {
    ...activity,
    price: Number(activity.price),
    averageRating,
  }
}

export async function createActivity(data: {
  templateId: string
  name: string
  description: string
  price: number
  durationMinutes: number
  difficulty: Difficulty
  minParticipants: number
  maxParticipants: number
  requirements?: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const operator = await db.operatorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!operator) throw new Error('Perfil de operador não encontrado')

  const template = await db.activityTemplate.findUnique({
    where: { id: data.templateId },
    include: { category: true },
  })
  if (!template) throw new Error('Template não encontrado')

  const baseSlug = slugify(data.name, { lower: true, strict: true })
  let slug = baseSlug
  let counter = 1

  while (await db.activity.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const activity = await db.activity.create({
    data: {
      slug,
      templateId: data.templateId,
      operatorId: operator.id,
      categoryId: template.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes,
      difficulty: data.difficulty,
      minParticipants: data.minParticipants,
      maxParticipants: data.maxParticipants,
      requirements: data.requirements,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      city: data.city,
      state: data.state,
    },
  })

  revalidatePath('/dashboard/atividades')
  return activity
}

export async function updateActivity(
  id: string,
  data: Partial<{
    name: string
    description: string
    price: number
    durationMinutes: number
    difficulty: Difficulty
    minParticipants: number
    maxParticipants: number
    requirements: string
    latitude: number
    longitude: number
    address: string
    city: string
    state: string
  }>
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const activity = await db.activity.findFirst({
    where: { id, operator: { userId: session.user.id } },
  })
  if (!activity) throw new Error('Atividade não encontrada')

  const updated = await db.activity.update({
    where: { id },
    data,
  })

  revalidatePath(`/atividades/${updated.slug}`)
  revalidatePath('/dashboard/atividades')
  return updated
}

export async function publishActivity(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const activity = await db.activity.findFirst({
    where: { id, operator: { userId: session.user.id } },
  })
  if (!activity) throw new Error('Atividade não encontrada')

  const updated = await db.activity.update({
    where: { id },
    data: { isPublished: !activity.isPublished },
  })

  revalidatePath(`/atividades/${updated.slug}`)
  revalidatePath('/dashboard/atividades')
  return updated
}

export async function deleteActivity(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  await db.activity.findFirstOrThrow({
    where: { id, operator: { userId: session.user.id } },
  })

  await db.activity.delete({ where: { id } })
  revalidatePath('/dashboard/atividades')
}

export async function getOperatorActivities() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  return db.activity.findMany({
    where: { operator: { userId: session.user.id } },
    include: {
      images: { take: 1 },
      _count: { select: { orders: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}
