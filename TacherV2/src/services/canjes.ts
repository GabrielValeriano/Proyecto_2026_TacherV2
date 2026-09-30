import { collection, getDocs, query, where, type DocumentData } from 'firebase/firestore'
import { db } from 'src/firebase'
import type { Canje } from 'src/types'

const COLECCION_CANJES = 'CANJES'

/** Nombres de los campos en Firestore. Si en tu base se llaman distinto, cambialos acá. */
const CAMPOS = {
  usuario: 'Usuario',
  producto: 'Producto',
  puntosCanjeados: 'PuntosCanjeados',
  codigo: 'Codigo',
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

function aCanje(docSnap: { id: string; data: () => DocumentData }): Canje {
  const datos = docSnap.data()
  return {
    id: docSnap.id,
    producto: String(datos[CAMPOS.producto] ?? '—'),
    puntosCanjeados: Number(datos[CAMPOS.puntosCanjeados]) || 0,
    codigo: String(datos[CAMPOS.codigo] ?? '—'),
    fecha: aFecha(datos[CAMPOS.fecha]),
  }
}

const enMilisegundos = (fecha: Date | string | null) => (fecha instanceof Date ? fecha.getTime() : 0)

/** Busca los canjes del usuario por nombre y devuelve el más reciente. */
export async function obtenerUltimoCanje(nombreUsuario: string): Promise<Canje | null> {
  const consulta = query(
    collection(db, COLECCION_CANJES),
    where(CAMPOS.usuario, '==', nombreUsuario),
  )
  const snapshot = await getDocs(consulta)

  const canjes = snapshot.docs.map(aCanje)
  canjes.sort((a, b) => enMilisegundos(b.fecha) - enMilisegundos(a.fecha))
  return canjes[0] ?? null
}
