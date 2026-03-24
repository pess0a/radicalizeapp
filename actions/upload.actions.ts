'use server'

import { auth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { db } from '@/lib/db'

export async function getUploadSignature() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `radicalize/activities/${session.user.id}`

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  }
}

export async function addActivityImage(
  activityId: string,
  url: string,
  cloudinaryId: string,
  alt?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  await db.activity.findFirstOrThrow({
    where: { id: activityId, operator: { userId: session.user.id } },
  })

  const maxOrder = await db.activityImage.findFirst({
    where: { activityId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  return db.activityImage.create({
    data: {
      activityId,
      url,
      cloudinaryId,
      alt,
      order: (maxOrder?.order ?? -1) + 1,
    },
  })
}

export async function removeActivityImage(imageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')

  const image = await db.activityImage.findFirst({
    where: { id: imageId, activity: { operator: { userId: session.user.id } } },
  })

  if (!image) throw new Error('Imagem não encontrada')

  await cloudinary.uploader.destroy(image.cloudinaryId)
  await db.activityImage.delete({ where: { id: imageId } })
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
}) {
  const bcrypt = await import('bcryptjs')
  const existing = await db.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email já cadastrado')

  const passwordHash = await bcrypt.hash(data.password, 12)

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
  })
}
