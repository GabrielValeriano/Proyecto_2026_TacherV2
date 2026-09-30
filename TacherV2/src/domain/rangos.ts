import { Award, Leaf, Zap, type LucideIcon } from 'lucide-react-native'

export interface Rango {
  name: string
  min: number
  icon: LucideIcon
}

export const RANGOS: Rango[] = [
  { name: 'Brote', min: 0, icon: Leaf },
  { name: 'Planta', min: 500, icon: Zap },
  { name: 'Arbol', min: 2000, icon: Award },
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
