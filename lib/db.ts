import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Force sslmode=require so pg-connection-string sets rejectUnauthorized=false.
  // Without this, a sslmode=verify-ca (or similar) in DATABASE_URL overwrites the
  // ssl config object via Object.assign inside pg's ConnectionParameters, causing
  // "self-signed certificate in certificate chain" even with ssl.rejectUnauthorized=false.
  // pg-connection-string v2 treats sslmode=require as verify-full.
  // uselibpqcompat=true restores standard libpq semantics where require = SSL without cert check.
  const url = new URL(process.env.DATABASE_URL!)
  url.searchParams.set('sslmode', 'require')
  url.searchParams.set('uselibpqcompat', 'true')
  const pool = new Pool({ connectionString: url.toString() })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
