import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db } from 'src/firebase'

export interface Reciclaje {
  id: string
  residuo: string
  puntos: number
  /** Date si Firestore la guarda como fecha; string si viene como texto no parseable. */
  fecha: Date | string | null
}

const COLECCION_RECICLAJES = 'RECICLAJES'

/** Nombres de los campos en Firestore. Si en tu base se llaman distinto, cambialos acá. */
const CAMPOS = {
  uid: 'Uid',
  usuario: 'Usuario',
  residuo: 'Residuo',
  puntos: 'PuntosGanados',
  fecha: 'Fecha',
} as const

function aFecha(valor: unknown): Date | string | null {
  const conToDate = valor as { toDate?: () => Date } | null
  if (conToDate && typeof conToDate.toDate === 'function') return conToDate.toDate() // Timestamp
  if (typeof valor === 'number') return new Date(valor)
  if (typeof valor === 'string') {
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime()) ? valor : fecha
  }
  return null
}

function aReciclaje(docSnap: { id: string; data: () => DocumentData }): Reciclaje {
  const datos = docSnap.data()
  return {
    id: docSnap.id,
    residuo: String(datos[CAMPOS.residuo] ?? 'Residuo'),
    puntos: Number(datos[CAMPOS.puntos]) || 0,
    fecha: aFecha(datos[CAMPOS.fecha]),
  }
}

/**
 * Los últimos reciclajes del usuario, del más nuevo al más viejo.
 * La primera vez Firestore pide crear un índice (Uid + Fecha descendente): en la terminal
 * aparece un error con un link que lo crea con un toque.
 */
export async function obtenerUltimosReciclajes(uid: string, cantidad = 10): Promise<Reciclaje[]> {
  const consulta = query(
    collection(db, COLECCION_RECICLAJES),
    where(CAMPOS.uid, '==', uid),
    orderBy(CAMPOS.fecha, 'desc'),
    limit(cantidad),
  )
  const snapshot = await getDocs(consulta)
  return snapshot.docs.map(aReciclaje)
}
