import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

export const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** PRNG determinístico para arte procedural estável entre renders */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const hash = (str: string) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Animações sempre ativas: ignora a preferência "reduzir movimento" do sistema. */
export const reducedMotion = () => false

export const uid = (n = 4) =>
  Math.random().toString(36).slice(2, 2 + n).toUpperCase()
