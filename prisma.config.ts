import { defineConfig } from '@prisma/config'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Load .env files since Prisma CLI doesn't load them before reading this config
function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.replace(/\r$/, '').match(/^([^#=\s][^=]*)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = value
      }
    }
  } catch {}
}

loadEnvFile(path.resolve('.env'))
loadEnvFile(path.resolve('.env.local'))

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL_NON_POOLING,
  },
})
