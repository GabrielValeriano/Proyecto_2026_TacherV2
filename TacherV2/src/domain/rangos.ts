import { Leaf, Sprout, Flower2, TreeDeciduous, type LucideIcon, Trees } from 'lucide-react-native'

export interface Rango {
  name: string
  min: number
  icon: LucideIcon
}

export const RANGOS: Rango[] = [
  { name: 'Hoja', min: 0, icon: Leaf },
  { name: 'Brote', min: 100, icon: Sprout },
  { name: 'Planta', min: 500, icon: Flower2 },
  { name: 'Arbol', min: 1000, icon: TreeDeciduous },
  { name: 'Bosque', min: 2000, icon: Trees },
]

export function getRangoParaPuntos(puntos = 0): Rango {
  return [...RANGOS].reverse().find((rango) => puntos >= rango.min) ?? RANGOS[0]
}

export function getProximoRango(puntos = 0): Rango | null {
  return RANGOS.find((rango) => puntos < rango.min) ?? null
}

export interface ResumenRango {
  actual: Rango
  proximo: Rango | null
  progreso: number
  puntosFaltantes: number
}

export function getResumenRango(puntos: number): ResumenRango {
  const actual = getRangoParaPuntos(puntos)
  const proximo = getProximoRango(puntos)

  if (!proximo) {
    return { actual, proximo, progreso: 100, puntosFaltantes: 0 }
  }

  const tramo = proximo.min - actual.min
  const progreso = Math.min(100, Math.round(((puntos - actual.min) / tramo) * 100))
  return { actual, proximo, progreso, puntosFaltantes: proximo.min - puntos }
}
