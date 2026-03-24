'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createActivity } from '@/actions/activity.actions'
import { toast } from 'sonner'

const schema = z.object({
  templateId: z.string().min(1, 'Selecione uma atividade'),
  name: z.string().min(3, 'Nome muito curto'),
  description: z.string().min(20, 'Descrição muito curta'),
  price: z.number().min(1, 'Preço inválido'),
  durationMinutes: z.number().min(15, 'Duração mínima: 15 min'),
  difficulty: z.enum(['EASY', 'MODERATE', 'HARD', 'EXTREME']),
  minParticipants: z.number().min(1),
  maxParticipants: z.number().min(1),
  requirements: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
})

type FormData = z.infer<typeof schema>

interface Category {
  id: string
  name: string
  templates: { id: string; name: string; description: string | null }[]
}

export function ActivityForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: 'MODERATE',
      minParticipants: 1,
      maxParticipants: 10,
      durationMinutes: 60,
    },
  })

  const templates = categories.find((c) => c.id === selectedCategoryId)?.templates ?? []

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await createActivity(data)
      toast.success('Atividade criada com sucesso!')
      router.push('/dashboard/atividades')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar atividade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Tipo de atividade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Categoria</Label>
            <Select onValueChange={(v: unknown) => {
              setSelectedCategoryId(String(v))
              setValue('templateId', '')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {templates.length > 0 && (
            <div>
              <Label>Atividade</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setValue('templateId', t.id)
                      if (!watch('name')) setValue('name', t.name)
                      if (!watch('description') && t.description) {
                        setValue('description', t.description)
                      }
                    }}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      watch('templateId') === t.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              {errors.templateId && (
                <p className="text-xs text-red-500 mt-1">{errors.templateId.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome da atividade</Label>
            <Input {...register('name')} placeholder="Ex: Jet Ski na Praia do Forte" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea {...register('description')} rows={4} placeholder="Descreva a experiência..." />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                {...register('durationMinutes', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label>Dificuldade</Label>
            <Select
              defaultValue="MODERATE"
              onValueChange={(v: unknown) => setValue('difficulty', v as FormData['difficulty'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Fácil</SelectItem>
                <SelectItem value="MODERATE">Moderado</SelectItem>
                <SelectItem value="HARD">Difícil</SelectItem>
                <SelectItem value="EXTREME">Extremo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mín. participantes</Label>
              <Input type="number" {...register('minParticipants', { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Máx. participantes</Label>
              <Input type="number" {...register('maxParticipants', { valueAsNumber: true })} />
            </div>
          </div>

          <div>
            <Label>Requisitos (opcional)</Label>
            <Textarea {...register('requirements')} rows={2} placeholder="Ex: Saber nadar, peso máximo 90kg..." />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Endereço</Label>
            <Input {...register('address')} placeholder="Rua, número, bairro" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cidade</Label>
              <Input {...register('city')} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label>Estado</Label>
              <Input {...register('state')} placeholder="Ex: BA" maxLength={2} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                placeholder="-12.9777"
              />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                placeholder="-38.5016"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Dica: clique com o botão direito no Google Maps e copie as coordenadas.
          </p>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Criando...' : 'Criar atividade'}
      </Button>
    </form>
  )
}
