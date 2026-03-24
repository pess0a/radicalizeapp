import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const categories = [
  {
    name: 'Litorâneas',
    slug: 'litoral',
    iconEmoji: '🌊',
    templates: [
      { name: 'Jet Ski', slug: 'jet-ski', description: 'Pilote um jet ski em águas abertas com toda a adrenalina e velocidade que você merece.' },
      { name: 'Passeio de Barco', slug: 'passeio-barco', description: 'Explore a costa e ilhas paradisíacas em um confortável passeio de barco.' },
      { name: 'Passeio de Catamarã', slug: 'passeio-catamara', description: 'Navegue com estabilidade e conforto em um catamarã, ideal para grupos e famílias.' },
      { name: 'Passeio de Lancha', slug: 'passeio-lancha', description: 'Velocidade e emoção em alto mar com uma lancha potente.' },
      { name: 'Banana Boat', slug: 'banana-boat', description: 'Diversão garantida para toda a família neste brinquedo inflável puxado por lancha.' },
      { name: 'Paratrike (Paraquedas Motorizado)', slug: 'paratrike', description: 'Sobrevoar o litoral suspenso por um paraquedas com motor — uma vista única do céu.' },
      { name: 'Kitesurf', slug: 'kitesurf', description: 'Deslize sobre as ondas impulsionado pelo vento com uma pipa gigante. Adrenalina pura.' },
      { name: 'Windsurf', slug: 'windsurf', description: 'Combine surf e vela neste esporte clássico que requer equilíbrio e sintonia com o vento.' },
      { name: 'Stand Up Paddle (SUP)', slug: 'sup', description: 'Explore rios, lagoas e mares em pé sobre uma prancha, remando em ritmo próprio.' },
      { name: 'Mergulho com Cilindro (Scuba Diving)', slug: 'scuba-diving', description: 'Explore o mundo subaquático com equipamento completo e instrutor certificado.' },
    ],
  },
  {
    name: 'Interior',
    slug: 'interior',
    iconEmoji: '🏔️',
    templates: [
      { name: 'Trilha até Cachoeira', slug: 'trilha-cachoeira', description: 'Caminhada em meio à mata nativa até cachoeiras cristalinas para um banho refrescante.' },
      { name: 'Rapel em Cachoeira', slug: 'rapel-cachoeira', description: 'Desce paredes de pedra molhadas ao lado de quedas d\'água com segurança e adrenalina.' },
      { name: 'Tirolesa', slug: 'tirolesa', description: 'Voe sobre o vale ou a copa das árvores suspenso num cabo de aço a alta velocidade.' },
      { name: 'Arvorismo', slug: 'arvorismo', description: 'Percurso suspenso entre as árvores com pontes, plataformas e obstáculos para todas as idades.' },
      { name: 'Trilha de Mountain Bike', slug: 'mountain-bike', description: 'Descidas e subidas em trilhas de terra com bike robusta para aventureiros de todos os níveis.' },
      { name: 'Cavalgada (Trilha a Cavalo)', slug: 'cavalgada', description: 'Explore a natureza sobre um cavalo em trilhas guiadas por paisagens deslumbrantes.' },
      { name: 'Escalada em Rocha', slug: 'escalada-rocha', description: 'Suba paredes de pedra naturais com equipamento de segurança e instrutor experiente.' },
      { name: 'Rafting', slug: 'rafting', description: 'Enfrente corredeiras em um bote inflável com seu grupo — diversão e adrenalina garantidas.' },
      { name: 'Canionismo', slug: 'canionismo', description: 'Explore cânions e piscinas naturais com técnicas de rappel, natação e escalada.' },
      { name: 'Trekking / Caminhada em Trilha', slug: 'trekking', description: 'Caminhadas de curta ou longa distância por trilhas com mirantes, fauna e flora nativos.' },
    ],
  },
]

// Fake activities — slug, templateSlug, name, description, price, durationMinutes, difficulty, minP, maxP, lat, lon, address, city, state, imageIds (Unsplash photo IDs)
const fakeActivities = [
  {
    slug: 'jet-ski-arraial-do-cabo',
    templateSlug: 'jet-ski',
    name: 'Jet Ski em Arraial do Cabo',
    description: 'Sinta a adrenalina pilotando um jet ski nas águas cristalinas de Arraial do Cabo. Você pode explorar as enseadas e praias ao redor da lagoa de Araruama com total liberdade. Equipamento de segurança fornecido e instrutor acompanhando.',
    price: 180,
    durationMinutes: 30,
    difficulty: 'EASY' as const,
    minParticipants: 1,
    maxParticipants: 2,
    latitude: -22.9711,
    longitude: -42.0198,
    address: 'Praia dos Anjos, s/n',
    city: 'Arraial do Cabo',
    state: 'RJ',
    imageUrls: [
      'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    ],
  },
  {
    slug: 'passeio-barco-ilhabela',
    templateSlug: 'passeio-barco',
    name: 'Passeio de Barco em Ilhabela',
    description: 'Navegue entre as ilhas e cachoeiras de Ilhabela em um confortável barco. O passeio inclui paradas para snorkeling, visita a praias desertas e almoço a bordo. Uma experiência inesquecível para famílias e casais.',
    price: 320,
    durationMinutes: 480,
    difficulty: 'EASY' as const,
    minParticipants: 2,
    maxParticipants: 12,
    latitude: -23.7781,
    longitude: -45.3581,
    address: 'Porto de Ilhabela, Av. Pedro Paulo de Moraes, 348',
    city: 'Ilhabela',
    state: 'SP',
    imageUrls: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    ],
  },
  {
    slug: 'kitesurf-jericoacoara',
    templateSlug: 'kitesurf',
    name: 'Aula de Kitesurf em Jericoacoara',
    description: 'Jericoacoara é um dos melhores spots de kitesurf do mundo. Com ventos constantes e água rasa, é o lugar perfeito para aprender ou evoluir na modalidade. Aula com instrutor certificado IKO, equipamento completo incluso.',
    price: 450,
    durationMinutes: 120,
    difficulty: 'MODERATE' as const,
    minParticipants: 1,
    maxParticipants: 4,
    latitude: -2.7976,
    longitude: -40.5128,
    address: 'Praia de Jericoacoara, s/n',
    city: 'Jijoca de Jericoacoara',
    state: 'CE',
    imageUrls: [
      'https://images.unsplash.com/photo-1564419431073-cec4ff0a7ee8?w=800&q=80',
      'https://images.unsplash.com/photo-1559628233-100c798642d5?w=800&q=80',
    ],
  },
  {
    slug: 'rafting-rio-jacare-pepira',
    templateSlug: 'rafting',
    name: 'Rafting no Rio Jacaré-Pepira',
    description: 'Um dos melhores rios para rafting do estado de São Paulo. Com corredeiras de nível II a IV, o percurso de 8 km é indicado para quem busca adrenalina em meio à Mata Atlântica. Equipamento e transfer inclusos.',
    price: 220,
    durationMinutes: 180,
    difficulty: 'HARD' as const,
    minParticipants: 4,
    maxParticipants: 8,
    latitude: -22.1736,
    longitude: -48.5614,
    address: 'Barra Bonita — acesso pela Rodovia SP-304',
    city: 'Brotas',
    state: 'SP',
    imageUrls: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    ],
  },
  {
    slug: 'trilha-cachoeira-chapada-diamantina',
    templateSlug: 'trilha-cachoeira',
    name: 'Trilha à Cachoeira da Fumaça',
    description: 'A Cachoeira da Fumaça é a maior queda d\'água do Brasil, com 340 metros de altura. O trekking até o mirante superior percorre 7 km em trilha de dificuldade moderada, com vista panorâmica deslumbrante. Guia local incluso.',
    price: 150,
    durationMinutes: 300,
    difficulty: 'MODERATE' as const,
    minParticipants: 1,
    maxParticipants: 15,
    latitude: -12.5681,
    longitude: -41.4693,
    address: 'Vale do Capão — ponto de encontro na praça central',
    city: 'Palmeiras',
    state: 'BA',
    imageUrls: [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    ],
  },
  {
    slug: 'tirolesa-urubici',
    templateSlug: 'tirolesa',
    name: 'Tirolesa no Vale em Urubici',
    description: 'Voe sobre o Vale do Rio Canoas a 120 metros de altura e 600 metros de extensão com vista para as serras catarinenses. A maior tirolesa do Sul do Brasil garante uma experiência única para toda a família.',
    price: 130,
    durationMinutes: 60,
    difficulty: 'EASY' as const,
    minParticipants: 1,
    maxParticipants: 20,
    latitude: -28.0155,
    longitude: -49.5921,
    address: 'Parque da Tirolesa, Estrada Geral Lajeado Grande, km 2',
    city: 'Urubici',
    state: 'SC',
    imageUrls: [
      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
      'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80',
    ],
  },
  {
    slug: 'escalada-rocha-pedra-do-bau',
    templateSlug: 'escalada-rocha',
    name: 'Escalada na Pedra do Baú',
    description: 'A Pedra do Baú, com 1950 m de altitude, é um dos maiores monólitos da América do Sul. A escalada guiada percorre vias de nível fácil a intermediário, com vista de 360° da Serra da Mantiqueira. Equipamento completo incluso.',
    price: 280,
    durationMinutes: 360,
    difficulty: 'HARD' as const,
    minParticipants: 1,
    maxParticipants: 6,
    latitude: -22.7578,
    longitude: -45.5086,
    address: 'Estrada da Pedra do Baú, s/n',
    city: 'São Bento do Sapucaí',
    state: 'SP',
    imageUrls: [
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&q=80',
    ],
  },
  {
    slug: 'sup-lagoa-da-conceicao',
    templateSlug: 'sup',
    name: 'Stand Up Paddle na Lagoa da Conceição',
    description: 'As águas calmas da Lagoa da Conceição são ideais para a prática de SUP. Aula introdutória com instrutor certificado, exploração da lagoa e das casinhas coloridas ao redor. Ideal para iniciantes e famílias com crianças.',
    price: 120,
    durationMinutes: 90,
    difficulty: 'EASY' as const,
    minParticipants: 1,
    maxParticipants: 8,
    latitude: -27.5987,
    longitude: -48.4573,
    address: 'Av. das Rendeiras, 1463 — Lagoa da Conceição',
    city: 'Florianópolis',
    state: 'SC',
    imageUrls: [
      'https://images.unsplash.com/photo-1515012548839-c9f8c5898a1c?w=800&q=80',
      'https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=800&q=80',
    ],
  },
  {
    slug: 'canionismo-canion-fortaleza',
    templateSlug: 'canionismo',
    name: 'Canionismo no Cânion Fortaleza',
    description: 'O Cânion Fortaleza, com 1000 metros de profundidade, é um dos mais impressionantes do Brasil. A atividade inclui rappel de 80 metros, travessia em piscinas naturais e caminhada técnica com guia especializado. Equipamento fornecido.',
    price: 350,
    durationMinutes: 420,
    difficulty: 'EXTREME' as const,
    minParticipants: 2,
    maxParticipants: 8,
    latitude: -29.0611,
    longitude: -49.8878,
    address: 'Parque Nacional de Aparados da Serra — Entrada Fortaleza',
    city: 'Cambará do Sul',
    state: 'RS',
    imageUrls: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    ],
  },
  {
    slug: 'mergulho-fernando-noronha',
    templateSlug: 'scuba-diving',
    name: 'Mergulho com Cilindro em Fernando de Noronha',
    description: 'Explore a vida marinha mais rica do Atlântico Sul nas águas de Fernando de Noronha. O mergulho guiado passa pelos principais pontos do arquipélago, com tartarugas, golfinhos e tubarões lixa. Certificação PADI não necessária.',
    price: 520,
    durationMinutes: 150,
    difficulty: 'MODERATE' as const,
    minParticipants: 2,
    maxParticipants: 6,
    latitude: -3.8555,
    longitude: -32.4313,
    address: 'Centro de Mergulho Noronha, Vila dos Remédios',
    city: 'Fernando de Noronha',
    state: 'PE',
    imageUrls: [
      'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=80',
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80',
    ],
  },
  {
    slug: 'trekking-chapada-dos-veadeiros',
    templateSlug: 'trekking',
    name: 'Trekking na Chapada dos Veadeiros',
    description: 'Percorra trilhas entre cachoeiras, vale da lua e cerrado nativo na Chapada dos Veadeiros. O trekking de dois dias inclui camping, guia local credenciado pelo ICMBio e toda a logística. Uma imersão completa no patrimônio natural do Cerrado.',
    price: 480,
    durationMinutes: 960,
    difficulty: 'MODERATE' as const,
    minParticipants: 2,
    maxParticipants: 12,
    address: 'Parque Nacional Chapada dos Veadeiros — Portaria São Jorge',
    city: 'Alto Paraíso de Goiás',
    state: 'GO',
    latitude: -14.1408,
    longitude: -47.6779,
    imageUrls: [
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80',
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
    ],
  },
  {
    slug: 'cavalgada-vale-do-capao',
    templateSlug: 'cavalgada',
    name: 'Cavalgada no Vale do Capão',
    description: 'Explore os campos e trilhas do Vale do Capão, na Chapada Diamantina, a cavalo. O passeio de 3 horas passa por riachos, fazendas históricas e mirantes naturais. Adequado para iniciantes. Capacete e colete fornecidos.',
    price: 200,
    durationMinutes: 180,
    difficulty: 'EASY' as const,
    minParticipants: 1,
    maxParticipants: 10,
    latitude: -12.5712,
    longitude: -41.4821,
    address: 'Fazenda Capão Verde, Estrada do Vale do Capão, km 5',
    city: 'Palmeiras',
    state: 'BA',
    imageUrls: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
      'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=800&q=80',
    ],
  },
]

// Generate future slots: next 30 days, 2 slots per day (morning and afternoon)
function generateSlots(startDate: Date, durationMinutes: number, capacity: number) {
  const slots = []
  for (let d = 1; d <= 30; d++) {
    const base = new Date(startDate)
    base.setDate(base.getDate() + d)

    for (const hour of [8, 14]) {
      const start = new Date(base)
      start.setHours(hour, 0, 0, 0)
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
      slots.push({ startTime: start, endTime: end, capacity, bookedCount: 0, status: 'AVAILABLE' as const })
    }
  }
  return slots
}

async function main() {
  console.log('Seeding database...')

  // ── Categories & templates ──────────────────────────────────────────────────
  for (const category of categories) {
    const { templates, ...categoryData } = category

    const cat = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    })

    for (const template of templates) {
      await prisma.activityTemplate.upsert({
        where: { slug: template.slug },
        update: { ...template, categoryId: cat.id },
        create: { ...template, categoryId: cat.id },
      })
    }

    console.log(`✓ ${cat.name} — ${templates.length} templates`)
  }

  // ── Fake operator ───────────────────────────────────────────────────────────
  const operator = await prisma.user.upsert({
    where: { email: 'operador@radicalize.com.br' },
    update: {},
    create: {
      email: 'operador@radicalize.com.br',
      name: 'Radicalize Aventuras',
      role: 'OPERATOR',
      emailVerified: new Date(),
    },
  })

  const operatorProfile = await prisma.operatorProfile.upsert({
    where: { userId: operator.id },
    update: {},
    create: {
      userId: operator.id,
      companyName: 'Radicalize Aventuras',
      description: 'Somos especialistas em turismo de aventura pelo Brasil. Mais de 10 anos levando pessoas a experiências únicas com segurança e responsabilidade ambiental.',
      verifiedAt: new Date(),
    },
  })

  console.log(`✓ Operador — ${operatorProfile.companyName}`)

  // ── Fake activities ─────────────────────────────────────────────────────────
  const now = new Date()

  for (const act of fakeActivities) {
    const template = await prisma.activityTemplate.findUnique({
      where: { slug: act.templateSlug },
      include: { category: true },
    })

    if (!template) {
      console.warn(`  ✗ Template "${act.templateSlug}" not found, skipping`)
      continue
    }

    const existing = await prisma.activity.findUnique({ where: { slug: act.slug } })

    let activity
    if (existing) {
      activity = await prisma.activity.update({
        where: { slug: act.slug },
        data: {
          name: act.name,
          description: act.description,
          price: act.price,
          durationMinutes: act.durationMinutes,
          difficulty: act.difficulty,
          minParticipants: act.minParticipants,
          maxParticipants: act.maxParticipants,
          latitude: act.latitude,
          longitude: act.longitude,
          address: act.address,
          city: act.city,
          state: act.state,
          isPublished: true,
        },
      })
    } else {
      activity = await prisma.activity.create({
        data: {
          slug: act.slug,
          templateId: template.id,
          operatorId: operatorProfile.id,
          categoryId: template.categoryId,
          name: act.name,
          description: act.description,
          price: act.price,
          durationMinutes: act.durationMinutes,
          difficulty: act.difficulty,
          minParticipants: act.minParticipants,
          maxParticipants: act.maxParticipants,
          latitude: act.latitude,
          longitude: act.longitude,
          address: act.address,
          city: act.city,
          state: act.state,
          isPublished: true,
        },
      })
    }

    // Images — delete old then recreate
    await prisma.activityImage.deleteMany({ where: { activityId: activity.id } })
    await prisma.activityImage.createMany({
      data: act.imageUrls.map((url, order) => ({
        activityId: activity.id,
        url,
        cloudinaryId: `seed-${activity.id}-${order}`,
        alt: act.name,
        order,
      })),
    })

    // Slots — delete old future slots then recreate
    await prisma.activitySlot.deleteMany({
      where: { activityId: activity.id, startTime: { gte: now } },
    })
    await prisma.activitySlot.createMany({
      data: generateSlots(now, act.durationMinutes, act.maxParticipants).map((s) => ({
        ...s,
        activityId: activity.id,
      })),
    })

    console.log(`  ✓ ${act.name} — ${act.city}/${act.state}`)
  }

  console.log('\nSeed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
