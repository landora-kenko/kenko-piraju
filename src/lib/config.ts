/**
 * Dados do restaurante. Tudo que está marcado com "AJUSTAR" é provisório
 * e deve ser confirmado com o Kenko antes da divulgação.
 */
const env = import.meta.env

export const RESTAURANT = {
  name: 'Kenko',
  kanji: '健康',
  meaning: 'saúde',
  tagline: 'Culinária japonesa em Piraju',
  city: 'Piraju',
  state: 'SP',
  address: 'Praça José Ataliba Leonel, 18, Centro, Piraju, SP, 18800-000',
  addressShort: 'Praça José Ataliba Leonel, 18, Centro',
  mapQuery: 'Kenko Sushi Bar, Praça José Ataliba Leonel, 18, Centro, Piraju, SP',
  phone: '(14) 3351-8176',
  phoneLink: '+551433518176',
  // WhatsApp e Instagram vêm das variáveis VITE_WHATSAPP e VITE_INSTAGRAM (secrets do GitHub)
  whatsapp: (env.VITE_WHATSAPP as string | undefined) ?? '',
  instagram: (env.VITE_INSTAGRAM as string | undefined) || 'kenkopiraju',
  // Horários (0 = domingo ... 6 = sábado). null = fechado
  hours: {
    0: ['18:30', '23:00'],
    1: null,
    2: ['18:30', '23:00'],
    3: ['18:30', '23:30'],
    4: ['18:30', '23:00'],
    5: ['18:30', '23:00'],
    6: ['18:30', '23:00'],
  } as Record<number, [string, string] | null>,
  hoursText: [
    ['Terça', '18h30 às 23h'],
    ['Quarta', '18h30 às 23h30'],
    ['Quinta a sábado', '18h30 às 23h'],
    ['Domingo', '18h30 às 23h'],
    ['Segunda', 'Fechado'],
  ],
}

/** AJUSTAR: taxas e tempos de entrega por região */
export const DELIVERY_ZONES = [
  { id: 'centro', label: 'Centro', fee: 6, eta: '30 a 45 min' },
  { id: 'proximos', label: 'Bairros próximos', fee: 9, eta: '40 a 55 min' },
  { id: 'afastados', label: 'Bairros afastados', fee: 13, eta: '50 a 70 min' },
] as const

export const MIN_DELIVERY_ORDER = 35

export const RESERVATION_SLOTS = [
  '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
]

export function openStatus(now = new Date()) {
  const today = RESTAURANT.hours[now.getDay()]
  const toMin = (s: string) => {
    const [h, m] = s.split(':').map(Number)
    return h * 60 + m
  }
  const cur = now.getHours() * 60 + now.getMinutes()
  if (today && cur >= toMin(today[0]) && cur < toMin(today[1]))
    return { open: true, text: `Aberto agora, fecha às ${today[1].replace(':00', 'h').replace(':', 'h')}` }
  if (today && cur < toMin(today[0]))
    return { open: false, text: `Abrimos hoje às ${today[0].replace(':00', 'h').replace(':', 'h')}` }
  for (let i = 1; i <= 7; i++) {
    const d = RESTAURANT.hours[(now.getDay() + i) % 7]
    if (d) {
      const names = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
      return { open: false, text: `Fechado agora, abrimos ${i === 1 ? 'amanhã' : names[(now.getDay() + i) % 7]} às ${d[0].replace(':00', 'h').replace(':', 'h')}` }
    }
  }
  return { open: false, text: 'Fechado' }
}

export const waLink = (text: string) =>
  RESTAURANT.whatsapp ? `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(text)}` : ''
