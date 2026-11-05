import { Leaf, Sprout, Flower2, TreeDeciduous, type LucideIcon, Trees } from 'lucide-react-native'

export interface Rango {
  name: string
  min: number
  icon: LucideIcon
}

export const RANGOS: Rango[] = [
  { name: 'Brote', min: 0, icon: Sprout },
  { name: 'Hoja', min: 10, icon: Leaf },
  { name: 'Planta', min: 25, icon: Flower2 },
  { name: 'Arbol', min: 50, icon: TreeDeciduous },
  { name: 'Bosque', min: 100, icon: Trees },
]

export function getRangoParaReciclajes(reciclajes = 0): Rango {
  const valor = Math.max(0, Number(reciclajes) || 0)
  return [...RANGOS].reverse().find((rango) => valor >= rango.min) ?? RANGOS[0]
}

export function getProximoRangoPorReciclajes(reciclajes = 0): Rango | null {
  const valor = Math.max(0, Number(reciclajes) || 0)
  return RANGOS.find((rango) => valor < rango.min) ?? null
}

export interface ResumenRangoPorReciclajes {
  actual: Rango
  proximo: Rango | null
  progreso: number
  reciclajesFaltantes: number
}

export function getResumenRangoPorReciclajes(reciclajes = 0): ResumenRangoPorReciclajes {
  const valor = Math.max(0, Number(reciclajes) || 0)
  const actual = getRangoParaReciclajes(valor)
  const proximo = getProximoRangoPorReciclajes(valor)

  if (!proximo) {
    return { actual, proximo: null, progreso: 100, reciclajesFaltantes: 0 }
  }

  const tramo = proximo.min - actual.min
  const progreso = Math.min(100, Math.round(((valor - actual.min) / tramo) * 100))
  const reciclajesFaltantes = Math.max(0, proximo.min - valor)
  return { actual, proximo, progreso, reciclajesFaltantes }
}

export function getRangoParaPuntos(puntos = 0): Rango {
  return getRangoParaReciclajes(puntos)
}

export function getProximoRango(puntos = 0): Rango | null {
  return getProximoRangoPorReciclajes(puntos)
}

export interface ResumenRango {
  actual: Rango
  proximo: Rango | null
  progreso: number
  puntosFaltantes: number
}

export function getResumenRango(puntos: number): ResumenRango {
  const resumen = getResumenRangoPorReciclajes(puntos)
  return {
    actual: resumen.actual,
    proximo: resumen.proximo,
    progreso: resumen.progreso,
    puntosFaltantes: resumen.reciclajesFaltantes,
  }
}
