# Radicalize — Plano Técnico

## 1. Tech Stack

### Framework
- **Next.js 15.x** — App Router, React Server Components, Server Actions
- **React 19.x**
- **TypeScript 5.x** — strict mode

### Database & ORM
- **PostgreSQL 16** — banco principal
- **Prisma 6.x** — ORM, migrations, client tipado
- **@auth/prisma-adapter** — integração Auth.js ↔ Prisma

### Autenticação
- **Auth.js v5 (NextAuth)** — sessões, OAuth, credentials
- Providers: Google OAuth + Email/Senha (bcrypt)

### Mapas
- **@vis.gl/react-google-maps 1.x** — wrapper React para Google Maps JS API v3
- APIs habilitadas: Maps JavaScript API, Geocoding API, Places API (New)
- Bounding box queries via `findMany` com índice em `latitude/longitude`

### Pagamentos
- **Stripe** — `stripe` (server SDK) + `@stripe/stripe-js` + `@stripe/react-stripe-js`
- Fluxo MVP: Stripe Checkout Session (página hospedada pelo Stripe)

### Armazenamento de Imagens
- **Cloudinary** — upload direto do client (assinado pelo server), transformações on-the-fly via URL

### Email
- **Resend** — emails transacionais
- **React Email** (`@react-email/components`) — templates HTML como componentes React

### Estado Global
- **Zustand** — compartilha estado entre mapa e lista (bounds, hover, pins)

### UI
- **Tailwind CSS 4.x**
- **shadcn/ui** — primitivos acessíveis (Dialog, Sheet, Select, etc.)
- **lucide-react** — ícones

### Deploy
- **Vercel** — hosting, Edge Network, variáveis de ambiente
- **Supabase** ou **Neon** — PostgreSQL gerenciado

### Bibliotecas de suporte
- `zod` — validação de formulários e payloads
- `react-hook-form` + `@hookform/resolvers` — estado de formulários
- `@googlemaps/markerclusterer` — agrupamento de pins no mapa
- `use-debounce` — debounce do evento `bounds_changed`
- `date-fns` — formatação de datas
- `slugify` — geração de slugs para URLs
- `@sentry/nextjs` — monitoramento de erros (Fase 6)

---

## 2. Estrutura do Projeto

```
radicalizeapp/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # resumo do operador
│   │   │   ├── atividades/
│   │   │   │   ├── nova/page.tsx         # criar atividade a partir de template
│   │   │   │   └── [id]/page.tsx         # editar atividade
│   │   │   └── pedidos/page.tsx          # pedidos recebidos
│   │   ├── conta/page.tsx                # histórico do usuário + avaliações
│   │   └── layout.tsx                    # requer sessão ativa
│   ├── atividades/
│   │   └── [slug]/page.tsx               # detalhe da atividade (público)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── webhooks/stripe/route.ts      # webhook Stripe
│   │   └── maps/activities/route.ts      # pins do mapa (bounding box)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                          # tela principal: mapa + listagem
├── components/
│   ├── map/
│   │   ├── MapView.tsx
│   │   ├── ActivityMarker.tsx
│   │   └── MarkerCluster.tsx
│   ├── activities/
│   │   ├── ActivityList.tsx
│   │   ├── ActivityCard.tsx
│   │   ├── ActivityFilters.tsx
│   │   └── ActivityGallery.tsx
│   ├── checkout/
│   │   ├── BookingPanel.tsx
│   │   └── StripeWrapper.tsx
│   ├── reviews/
│   │   ├── ReviewList.tsx
│   │   ├── ReviewForm.tsx
│   │   └── StarRating.tsx
│   ├── dashboard/
│   │   ├── ActivityForm.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── OrderTable.tsx
│   │   └── AvailabilityEditor.tsx
│   ├── ui/                               # shadcn/ui re-exports
│   └── providers/
│       ├── SessionProvider.tsx
│       └── MapProvider.tsx
├── lib/
│   ├── db.ts                             # Prisma client singleton
│   ├── auth.ts                           # Auth.js config
│   ├── stripe.ts                         # Stripe client singleton
│   ├── cloudinary.ts
│   ├── resend.ts
│   └── utils.ts
├── actions/
│   ├── activity.actions.ts
│   ├── order.actions.ts
│   ├── review.actions.ts
│   ├── operator.actions.ts
│   ├── checkout.actions.ts
│   └── upload.actions.ts
├── store/
│   └── mapStore.ts                       # Zustand store (pins, hover, bounds)
├── emails/
│   ├── OrderConfirmation.tsx
│   ├── OperatorNotification.tsx
│   └── layouts/BaseEmail.tsx
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── types/
│   ├── activity.ts
│   ├── order.ts
│   └── maps.ts
├── hooks/
│   ├── useMapSync.ts
│   ├── useActivityHover.ts
│   └── useInfiniteActivities.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## 3. Schema do Banco de Dados

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─── Auth.js (tabelas obrigatórias) ──────────────────────────
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ─── Domínio principal ───────────────────────────────────────
model User {
  id              String           @id @default(cuid())
  name            String?
  email           String?          @unique
  emailVerified   DateTime?
  image           String?
  passwordHash    String?          // null para usuários OAuth
  phone           String?
  role            Role             @default(CUSTOMER)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  accounts        Account[]
  sessions        Session[]
  orders          Order[]
  reviews         Review[]
  operatorProfile OperatorProfile?
}

enum Role {
  CUSTOMER
  OPERATOR
  ADMIN
}

model OperatorProfile {
  id              String     @id @default(cuid())
  userId          String     @unique
  companyName     String
  cnpj            String?    @unique
  description     String?    @db.Text
  logoUrl         String?
  website         String?
  instagramHandle String?
  stripeAccountId String?    // Stripe Connect (payouts futuros)
  verifiedAt      DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities      Activity[]
}

model Category {
  id         String             @id @default(cuid())
  name       String             @unique   // "Litorâneas" | "Interior"
  slug       String             @unique
  templates  ActivityTemplate[]
  activities Activity[]
}

model ActivityTemplate {
  id          String     @id @default(cuid())
  name        String                        // ex: "Jet Ski"
  slug        String     @unique
  categoryId  String
  iconUrl     String?
  description String?    @db.Text
  category    Category   @relation(fields: [categoryId], references: [id])
  activities  Activity[]
}

model Activity {
  id              String           @id @default(cuid())
  slug            String           @unique
  templateId      String
  operatorId      String
  categoryId      String
  name            String
  description     String           @db.Text
  price           Decimal          @db.Decimal(10, 2)
  durationMinutes Int
  difficulty      Difficulty       @default(MODERATE)
  minParticipants Int              @default(1)
  maxParticipants Int
  requirements    String?          @db.Text
  isPublished     Boolean          @default(false)
  latitude        Float
  longitude       Float
  address         String
  city            String
  state           String
  images          ActivityImage[]
  slots           ActivitySlot[]
  orders          Order[]
  reviews         Review[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  template        ActivityTemplate @relation(fields: [templateId], references: [id])
  operator        OperatorProfile  @relation(fields: [operatorId], references: [id])
  category        Category         @relation(fields: [categoryId], references: [id])

  @@index([latitude, longitude])
  @@index([categoryId])
  @@index([isPublished])
}

enum Difficulty {
  EASY
  MODERATE
  HARD
  EXTREME
}

model ActivityImage {
  id           String   @id @default(cuid())
  activityId   String
  url          String
  cloudinaryId String
  alt          String?
  order        Int      @default(0)
  activity     Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
}

model ActivitySlot {
  id          String     @id @default(cuid())
  activityId  String
  startTime   DateTime
  endTime     DateTime
  capacity    Int
  bookedCount Int        @default(0)
  status      SlotStatus @default(AVAILABLE)
  orders      Order[]
  activity    Activity   @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@index([activityId, startTime])
}

enum SlotStatus {
  AVAILABLE
  FULL
  CANCELLED
}

model Order {
  id                    String      @id @default(cuid())
  userId                String
  activityId            String
  slotId                String
  quantity              Int         @default(1)
  totalAmountCents      Int
  currency              String      @default("BRL")
  status                OrderStatus @default(PENDING)
  stripeCheckoutId      String?     @unique
  stripePaymentIntentId String?
  confirmedAt           DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  user                  User        @relation(fields: [userId], references: [id])
  activity              Activity    @relation(fields: [activityId], references: [id])
  slot                  ActivitySlot @relation(fields: [slotId], references: [id])
  review                Review?
}

enum OrderStatus {
  PENDING
  PAID
  CANCELLED
  REFUNDED
}

model Review {
  id         String   @id @default(cuid())
  orderId    String   @unique   // uma avaliação por pedido
  userId     String
  activityId String
  rating     Int               // 1–5
  comment    String?  @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  order      Order    @relation(fields: [orderId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
  activity   Activity @relation(fields: [activityId], references: [id])
}
```

---

## 4. API Routes e Server Actions

### Route Handlers

| Método | Caminho | Função |
|---|---|---|
| GET | `/api/maps/activities` | Query por bounding box para os pins do mapa. Params: `swLat, swLng, neLat, neLng, categoryId?` |
| POST | `/api/webhooks/stripe` | Webhook Stripe: processa `checkout.session.completed`, marca pedido como PAID, envia emails |
| GET/POST | `/api/auth/[...nextauth]` | Handler do Auth.js |

### Server Actions

**`activity.actions.ts`**
- `getActivities(filters)` — lista paginada com filtros (categoria, preço, dificuldade, bounds)
- `getActivityBySlug(slug)` — detalhe completo com imagens, avaliações, slots, operador
- `createActivity(formData)` — operador cria a partir de template
- `updateActivity(id, formData)` — operador edita a própria atividade
- `publishActivity(id)` — toggle `isPublished`
- `deleteActivity(id)` — soft delete

**`checkout.actions.ts`**
- `createCheckoutSession(slotId, quantity)` — cria pedido PENDING + Stripe Checkout Session, redireciona para Stripe
- `getCheckoutResult(sessionId)` — valida resultado na URL de retorno

**`order.actions.ts`**
- `getUserOrders()` — histórico do usuário logado
- `getOperatorOrders()` — pedidos de todas as atividades do operador

**`review.actions.ts`**
- `submitReview(orderId, rating, comment)` — valida que o usuário tem um pedido PAID sem avaliação
- `getActivityReviews(activityId, page)` — avaliações paginadas

**`operator.actions.ts`**
- `getOrCreateOperatorProfile()` — retorna ou cria perfil, promove role para OPERATOR
- `updateOperatorProfile(data)`

**`upload.actions.ts`**
- `getUploadSignature()` — gera assinatura Cloudinary para upload direto do client

---

## 5. Páginas e Componentes Principais

### `/` — Tela Principal (Mapa + Lista)

Layout CSS Grid: `grid-cols-[420px_1fr]` no desktop, empilhado no mobile.

**Painel Esquerdo — `ActivityList`:**
- Server Component → busca atividades iniciais no servidor (SSR para SEO e primeiro render)
- Re-fetch client-side quando os bounds do mapa mudam via `useMapSync`
- Scroll infinito com Intersection Observer (`useInfiniteActivities`)
- `ActivityFilters`: pills de categoria, slider de preço, chips de dificuldade
- `ActivityCard`: thumbnail, nome, estrelas, preço, cidade
- Hover no card → destaca o marker no mapa via Zustand (`useActivityHover`)

**Painel Direito — `MapView`:**
- Client Component obrigatório (`"use client"`)
- `<APIProvider>` do `@vis.gl/react-google-maps`
- Evento `bounds_changed` → debounce 400ms → fetch `/api/maps/activities`
- `ActivityMarker` por pin; hover/click sincroniza com a lista
- `MarkerCluster` com `@googlemaps/markerclusterer` (SuperClusterAlgorithm)

**Zustand Store (`store/mapStore.ts`):**
```ts
interface MapStore {
  hoveredActivityId: string | null
  setHovered: (id: string | null) => void
  pins: PinData[]
  setPins: (pins: PinData[]) => void
}
```

---

### `/atividades/[slug]` — Detalhe da Atividade

Server Component com `generateStaticParams` (ISR, revalidate 60s).

**Seções:**
1. `ActivityGallery` — carrossel de fotos (embla-carousel)
2. Nome, operador, badges de categoria e dificuldade
3. Descrição completa
4. `BookingPanel` (Client, sticky no desktop):
   - Lista de `ActivitySlot` futuros com seletor de data
   - Seletor de quantidade (respeita capacidade restante)
   - Botão "Comprar" → chama `createCheckoutSession`
   - Se não logado → abre modal de login antes
5. Mapa estático com localização
6. Card do operador
7. `ReviewList` com média e avaliações individuais
8. `ReviewForm` — aparece apenas para usuários com pedido PAID e sem avaliação

**SEO:** `generateMetadata` com título, descrição e OpenGraph da primeira foto.

---

### `/dashboard` — Dashboard do Operador

Protegido por `middleware.ts` (requer sessão + role OPERATOR).

**`/dashboard` (índice):** cards de resumo (total atividades, pedidos do mês, receita) + tabela de pedidos recentes.

**`/dashboard/atividades/nova`:**
1. `TemplateSelector` — grid de cards agrupados por categoria
2. `ActivityForm` — nome, descrição, preço, duração, dificuldade, participantes, requisitos, localização (Places Autocomplete → lat/lng), slots
3. `ImageUploader` — drag-and-drop, upload direto Cloudinary, preview com reordenação
4. Submit → `createActivity`

**`/dashboard/pedidos`:** tabela de pedidos com status, cliente, atividade, horário, valor.

---

### `/conta` — Conta do Usuário

- Informações do perfil
- Histórico de pedidos com status e link para atividade
- Avaliações feitas
- Cards de "Avalie sua experiência" para pedidos PAID sem avaliação

---

## 6. Integração Google Maps

### Sincronização bounds → lista

```ts
// hooks/useMapSync.ts
export function useMapSync() {
  const map = useMap()
  const setPins = useMapStore(s => s.setPins)

  const fetchPins = useDebouncedCallback(async () => {
    const bounds = map?.getBounds()
    if (!bounds) return
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const res = await fetch(
      `/api/maps/activities?swLat=${sw.lat()}&swLng=${sw.lng()}&neLat=${ne.lat()}&neLng=${ne.lng()}`
    )
    setPins(await res.json())
  }, 400)

  useEffect(() => {
    if (!map) return
    const listener = map.addListener('bounds_changed', fetchPins)
    return () => listener.remove()
  }, [map, fetchPins])
}
```

### Query de pins no servidor

```ts
// app/api/maps/activities/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const swLat = parseFloat(searchParams.get('swLat')!)
  const neLat = parseFloat(searchParams.get('neLat')!)
  const swLng = parseFloat(searchParams.get('swLng')!)
  const neLng = parseFloat(searchParams.get('neLng')!)

  const activities = await db.activity.findMany({
    where: {
      isPublished: true,
      latitude:  { gte: swLat, lte: neLat },
      longitude: { gte: swLng, lte: neLng },
    },
    select: {
      id: true, slug: true, name: true,
      latitude: true, longitude: true, price: true,
      images: { take: 1, select: { url: true } },
    },
    take: 200,
  })

  return Response.json(activities)
}
```

---

## 7. Fluxo de Pagamento (Stripe)

### Passo 1 — Usuário clica em "Comprar"

`BookingPanel` chama a Server Action `createCheckoutSession`:

```ts
// actions/checkout.actions.ts
'use server'
export async function createCheckoutSession(slotId: string, quantity: number) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=...')

  const slot = await db.activitySlot.findUniqueOrThrow({
    where: { id: slotId },
    include: { activity: { include: { images: { take: 1 } } } }
  })

  const available = slot.capacity - slot.bookedCount
  if (quantity > available) throw new Error('Vagas insuficientes')

  const totalCents = Math.round(Number(slot.activity.price) * quantity * 100)

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      activityId: slot.activityId,
      slotId, quantity,
      totalAmountCents: totalCents,
      status: 'PENDING',
    }
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'brl',
    line_items: [{
      price_data: {
        currency: 'brl',
        unit_amount: Math.round(Number(slot.activity.price) * 100),
        product_data: { name: slot.activity.name },
      },
      quantity,
    }],
    metadata: { orderId: order.id },
    success_url: `${process.env.NEXT_PUBLIC_URL}/conta?order=${order.id}&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/atividades/${slot.activity.slug}?cancelled=true`,
  })

  await db.order.update({
    where: { id: order.id },
    data: { stripeCheckoutId: checkoutSession.id }
  })

  redirect(checkoutSession.url!)
}
```

### Passo 2 — Webhook Stripe

```ts
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const order = await db.order.findUniqueOrThrow({
      where: { stripeCheckoutId: session.id }
    })

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { status: 'PAID', confirmedAt: new Date(),
                stripePaymentIntentId: session.payment_intent as string }
      }),
      db.activitySlot.update({
        where: { id: order.slotId },
        data: { bookedCount: { increment: order.quantity } }
      }),
    ])

    await sendOrderConfirmationEmail(order.id)
    await sendOperatorNotificationEmail(order.id)
  }

  return new Response('OK', { status: 200 })
}
```

### Passo 3 — Pós-compra

Usuário retorna para `/conta?order=xyz&success=true`. A página exibe o banner de sucesso e o detalhe do pedido.

> **Teste local:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## 8. Upload de Imagens (Cloudinary)

### Fluxo: assinatura no servidor + upload direto do client

**Passo 1 — Obter assinatura (Server Action)**

```ts
// actions/upload.actions.ts
'use server'
export async function getUploadSignature() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `radicalize/activities/${session.user.id}`
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    timestamp, signature, folder,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  }
}
```

**Passo 2 — Upload direto do client**

```ts
const sig = await getUploadSignature()
const formData = new FormData()
formData.append('file', file)
formData.append('api_key', sig.apiKey)
formData.append('timestamp', String(sig.timestamp))
formData.append('signature', sig.signature)
formData.append('folder', sig.folder)

const res = await fetch(
  `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
  { method: 'POST', body: formData }
)
const { secure_url, public_id } = await res.json()
// Salvar secure_url e public_id em ActivityImage
```

**Transformações via URL:** `f_auto,q_auto,w_800` para galeria; `f_auto,q_auto,w_400,h_300,c_fill` para cards.

---

## 9. Fases de Desenvolvimento

### Fase 1 — Base (Semana 1–2)
- Inicializar Next.js 15 com TypeScript, Tailwind, shadcn/ui
- Schema Prisma + migration no Supabase/Neon
- Auth.js com Google OAuth e Credentials
- `middleware.ts` para proteção de rotas
- Seed: categorias + 20 templates de atividades
- Deploy Vercel + variáveis de ambiente

**Entrega:** Auth funcionando, banco de dados ativo, rotas protegidas.

### Fase 2 — Experiência de Navegação (Semana 3–4)
- Tela principal com split-view (dados mockados inicialmente)
- `MapView` com `@vis.gl/react-google-maps`
- `/api/maps/activities` (bounding box)
- `ActivityList`, `ActivityCard`, `ActivityFilters`
- `useMapSync` + Zustand store (sincronismo hover/bounds)
- Clustering de markers
- `/atividades/[slug]` (sem compra ainda)

**Entrega:** Experiência de navegação completa. Mapa e lista sincronizados.

### Fase 3 — Dashboard do Operador (Semana 5–6)
- Fluxo de registro do operador (upgrade de role, OperatorProfile)
- `TemplateSelector`, `ActivityForm`, `AvailabilityEditor`
- `ImageUploader` com Cloudinary
- Server actions: `createActivity`, `updateActivity`, `publishActivity`
- Visualização de pedidos no dashboard

**Entrega:** Operadores criam, publicam e gerenciam atividades.

### Fase 4 — Fluxo de Compra (Semana 7–8)
- `BookingPanel` com seleção de slot e quantidade
- `createCheckoutSession` + Stripe Checkout
- Webhook Stripe com transação atômica
- Página de confirmação em `/conta`
- Emails com Resend + React Email

**Entrega:** Compra completa funcionando em modo teste do Stripe.

### Fase 5 — Avaliações e Polimento (Semana 9)
- `ReviewForm` (exibido após a data da atividade, para pedidos PAID)
- `submitReview` com validação de compra
- Média de avaliações na página de detalhe
- QA da jornada completa: navegar → comprar → avaliar
- Acessibilidade (navegação por teclado, ARIA nos markers do mapa)

**Entrega:** Sistema de avaliações completo.

### Fase 6 — Produção (Semana 10)
- Stripe modo live + webhook em produção
- Vercel Analytics e Speed Insights
- `robots.txt` + `sitemap.xml` automático (atividades publicadas)
- Rate limiting em checkout e auth (Upstash Redis)
- Monitoramento de erros com Sentry
- Revisão de segurança: CSRF, XSS, SQL injection

**Entrega:** Pronto para ir ao ar.

---

## 10. Variáveis de Ambiente

```bash
# ── Banco de dados ────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/radicalize?sslmode=require"

# ── Auth.js ───────────────────────────────────────────────────
AUTH_SECRET="gerar-com-openssl-rand-base64-32"
AUTH_GOOGLE_ID="seu-google-oauth-client-id"
AUTH_GOOGLE_SECRET="seu-google-oauth-client-secret"

# ── Google Maps ───────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
# Restringir por referenciador HTTP no Google Cloud Console

# ── Stripe ────────────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_test_..."         # sk_live_... em produção
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ── Cloudinary ────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="secret"          # nunca expor com NEXT_PUBLIC_

# ── Resend (email) ────────────────────────────────────────────
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@radicalizeapp.com"

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_URL="https://radicalizeapp.com"   # http://localhost:3000 localmente

# ── Monitoramento (Fase 6) ────────────────────────────────────
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."
```

> **Regra:** toda variável `NEXT_PUBLIC_` é exposta ao browser. Nunca colocar segredos com esse prefixo.

---

## Decisões de Arquitetura

**Stripe Checkout vs. Stripe Elements:** Checkout hospedado pelo Stripe para o MVP — lida automaticamente com SCA/3DS, PCI compliance e otimização mobile. Migrar para Elements em v2 para experiência totalmente in-app.

**Cloudinary vs. Vercel Blob:** Cloudinary gera tamanhos responsivos on-the-fly via parâmetros de URL (`c_fill`, `f_auto`, `q_auto`). Com Vercel Blob seria necessário gerar e armazenar múltiplas versões manualmente.

**Zustand vs. React Context para sincronismo mapa/lista:** Os bounds mudam com alta frequência durante pan/zoom. As subscriptions seletivas do Zustand evitam re-render de toda a árvore. `ActivityList` subscreve `pins`; `ActivityMarker` subscreve apenas `hoveredActivityId`.

**Lat/lng como Float vs. PostGIS:** Queries `BETWEEN` em colunas float indexadas suportam centenas de milhares de registros sem PostGIS. Adicionar PostGIS e `ST_DWithin` quando precisar de busca por raio ("atividades a X km de mim").

**Auth.js v5 vs. Clerk:** Sem custo por MAU em escala. Controle total da tabela User. A conta unificada operador/cliente é mais simples quando você é dono do modelo User.

---

## Arquivos Críticos

- [prisma/schema.prisma](prisma/schema.prisma) — todo o modelo de domínio; base para todos os outros arquivos. Deve ser criado e migrado primeiro.
- [app/page.tsx](app/page.tsx) — tela principal (split-view); a página mais complexa arquiteturalmente.
- [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts) — backbone financeiro; bugs aqui causam perda silenciosa de pedidos. Transação atômica e verificação de assinatura são críticas.
- [lib/auth.ts](lib/auth.ts) — configuração do Auth.js; o campo `role` no token de sessão desbloqueia todo o dashboard.
- [actions/checkout.actions.ts](actions/checkout.actions.ts) — entrada do fluxo de compra; deve tratar concorrência (capacidade do slot), redirecionamento de não-autenticados e criação segura da sessão Stripe.
