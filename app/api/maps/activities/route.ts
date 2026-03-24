import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const swLat = parseFloat(searchParams.get('swLat') ?? '0')
  const swLng = parseFloat(searchParams.get('swLng') ?? '0')
  const neLat = parseFloat(searchParams.get('neLat') ?? '0')
  const neLng = parseFloat(searchParams.get('neLng') ?? '0')
  const categoryId = searchParams.get('categoryId') ?? undefined

  if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) {
    return NextResponse.json({ error: 'Invalid bounds' }, { status: 400 })
  }

  const activities = await db.activity.findMany({
    where: {
      isPublished: true,
      latitude: { gte: swLat, lte: neLat },
      longitude: { gte: swLng, lte: neLng },
      ...(categoryId ? { categoryId } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      latitude: true,
      longitude: true,
      price: true,
      images: {
        take: 1,
        orderBy: { order: 'asc' },
        select: { url: true },
      },
    },
    take: 200,
  })

  const pins = activities.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    latitude: a.latitude,
    longitude: a.longitude,
    price: Number(a.price),
    imageUrl: a.images[0]?.url ?? null,
  }))

  return NextResponse.json(pins)
}
