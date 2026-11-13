import { Leaf, Sprout, Flower2, TreeDeciduous, type LucideIcon, Trees } from 'lucide-react-native'

export interface Nivel {
  name: string
  min: number
  icon: LucideIcon
}

export const NIVELES: Nivel[] = [
  { name: 'Brote', min: 0, icon: Sprout },
  { name: 'Planta', min: 25, icon: Flower2 },
  { name: 'Arbol', min: 50, icon: TreeDeciduous },
  { name: 'Bosque', min: 100, icon: Trees },
]

export function getNivelParaReciclajes(reciclajes = 0): Nivel {
  const valor = Math.max(0, Number(reciclajes) || 0)
  return [...NIVELES].reverse().find((nivel) => valor >= nivel.min) ?? NIVELES[0]
}

export function getProximoNivelPorReciclajes(reciclajes = 0): Nivel | null {
  const valor = Math.max(0, Number(reciclajes) || 0)
  return NIVELES.find((nivel) => valor < nivel.min) ?? null
}

export interface ResumenNivelPorReciclajes {
  actual: Nivel
  proximo: Nivel | null
  progreso: number
  reciclajesFaltantes: number
}

export function getResumenNivelPorReciclajes(reciclajes = 0): ResumenNivelPorReciclajes {
  const valor = Math.max(0, Number(reciclajes) || 0)
  const actual = getNivelParaReciclajes(valor)
  const proximo = getProximoNivelPorReciclajes(valor)

  if (!proximo) {
    return { actual, proximo: null, progreso: 100, reciclajesFaltantes: 0 }
  }

  const tramo = proximo.min - actual.min
  const progreso = Math.min(100, Math.round(((valor - actual.min) / tramo) * 100))
  const reciclajesFaltantes = Math.max(0, proximo.min - valor)
  return { actual, proximo, progreso, reciclajesFaltantes }
}

export function getNivelParaPuntos(puntos = 0): Nivel {
  return getNivelParaReciclajes(puntos)
}

export function getProximoNivel(puntos = 0): Nivel | null {
  return getProximoNivelPorReciclajes(puntos)
}

export interface ResumenNivel {
  actual: Nivel
  proximo: Nivel | null
  progreso: number
  puntosFaltantes: number
}

export function getResumenNivel(puntos: number): ResumenNivel {
  const resumen = getResumenNivelPorReciclajes(puntos)
  return {
    actual: resumen.actual,
    proximo: resumen.proximo,
    progreso: resumen.progreso,
    puntosFaltantes: resumen.reciclajesFaltantes,
  }
}
