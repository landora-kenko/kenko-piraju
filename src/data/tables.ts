/**
 * MAPA DE MESAS PROVISÓRIO
 * Posições (x, y) numa tela de 900 x 560. Ajuste conforme a planta real do salão.
 */
export type TableStatus = 'livre' | 'ocupada' | 'reservada'
export type Zone = 'balcao' | 'salao' | 'tatame' | 'varanda'

export interface TableDef {
  id: string
  label: string
  zone: Zone
  seats: number
  x: number
  y: number
  shape: 'round' | 'square' | 'stool' | 'low'
}

export const ZONES: Record<Zone, { name: string; jp: string }> = {
  balcao: { name: 'Balcão do sushiman', jp: 'カウンター' },
  salao: { name: 'Salão', jp: '座敷' },
  tatame: { name: 'Tatame', jp: '畳' },
  varanda: { name: 'Varanda', jp: '縁側' },
}

export const TABLES: TableDef[] = [
  ...Array.from({ length: 6 }, (_, i): TableDef => ({
    id: `B${i + 1}`, label: `Balcão ${i + 1}`, zone: 'balcao', seats: 1, x: 150 + i * 62, y: 112, shape: 'stool',
  })),
  { id: 'S1', label: 'Mesa 1', zone: 'salao', seats: 2, x: 130, y: 270, shape: 'square' },
  { id: 'S2', label: 'Mesa 2', zone: 'salao', seats: 2, x: 255, y: 270, shape: 'square' },
  { id: 'S3', label: 'Mesa 3', zone: 'salao', seats: 4, x: 380, y: 270, shape: 'round' },
  { id: 'S4', label: 'Mesa 4', zone: 'salao', seats: 4, x: 130, y: 410, shape: 'round' },
  { id: 'S5', label: 'Mesa 5', zone: 'salao', seats: 4, x: 255, y: 410, shape: 'round' },
  { id: 'S6', label: 'Mesa 6', zone: 'salao', seats: 4, x: 380, y: 410, shape: 'round' },
  { id: 'T1', label: 'Tatame 1', zone: 'tatame', seats: 6, x: 640, y: 180, shape: 'low' },
  { id: 'T2', label: 'Tatame 2', zone: 'tatame', seats: 6, x: 640, y: 320, shape: 'low' },
  { id: 'V1', label: 'Varanda 1', zone: 'varanda', seats: 4, x: 760, y: 470, shape: 'round' },
  { id: 'V2', label: 'Varanda 2', zone: 'varanda', seats: 4, x: 630, y: 470, shape: 'round' },
]

export const DEMO_STATUS: Record<string, TableStatus> = {
  B2: 'ocupada', B3: 'ocupada', S2: 'ocupada', S3: 'reservada', S5: 'ocupada', T1: 'reservada', V1: 'ocupada',
}
