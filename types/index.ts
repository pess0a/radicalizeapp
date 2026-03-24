import type { Activity, ActivityImage, ActivitySlot, Category, OperatorProfile, Review, User } from '@prisma/client'

export type PinData = {
  id: string
  slug: string
  name: string
  latitude: number
  longitude: number
  price: number
  imageUrl?: string
}

export type ActivityWithDetails = Activity & {
  images: ActivityImage[]
  slots: ActivitySlot[]
  reviews: (Review & { user: Pick<User, 'id' | 'name' | 'image'> })[]
  operator: OperatorProfile & { user: Pick<User, 'id' | 'name' | 'image'> }
  category: Category
  _count?: { reviews: number }
  averageRating?: number
}

export type ActivityCardData = {
  id: string
  slug: string
  name: string
  city: string
  state: string
  price: number
  durationMinutes: number
  difficulty: string
  images: { url: string; alt: string | null }[]
  averageRating?: number
  reviewCount?: number
  categoryName?: string
}

export type FiltersState = {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  difficulty?: string
  swLat?: number
  swLng?: number
  neLat?: number
  neLng?: number
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: import('@prisma/client').Role
    }
  }
}
