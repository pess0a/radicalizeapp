export const dynamic = 'force-dynamic'

import { getCategories } from '@/actions/operator.actions'
import { ActivityForm } from '@/components/dashboard/ActivityForm'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NovaAtividadePage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={14} />
          Voltar ao dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Nova atividade</h1>

        <ActivityForm categories={categories} />
      </div>
    </div>
  )
}
