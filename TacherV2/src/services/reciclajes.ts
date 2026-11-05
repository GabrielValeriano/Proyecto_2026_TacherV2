import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from 'src/firebase'

export interface Reciclaje {
  id: string
  residuo: string
  puntos: number
  /** Date si Firestore la guarda como fecha; string si viene como texto no parseable. */
  fecha: Date | string | null
  categoria?: string | null
  residuoId?: string | null
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

function obtenerValor(datos: DocumentData, ...claves: string[]) {
  for (const clave of claves) {
    if (datos[clave] !== undefined && datos[clave] !== null) {
      return datos[clave]
    }
  }
  return undefined
}

function aFecha(valor: unknown): Date | string | null {
  const conToDate = valor as { toDate?: () => Date } | null
  if (conToDate && typeof conToDate.toDate === 'function') return conToDate.toDate()
  if (typeof valor === 'number') return new Date(valor)
  if (typeof valor === 'string') {
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime()) ? valor : fecha
  }
  return null
}

function aReciclaje(docSnap: { id: string; data: () => DocumentData }): Reciclaje {
  const datos = docSnap.data()
  const categoriaRaw = obtenerValor(datos, 'Categoria', 'categoria', 'Tipo', 'tipo')
  const categoria =
    typeof categoriaRaw === 'string' ? categoriaRaw : categoriaRaw ? String(categoriaRaw) : null

  const residuoIdRaw = obtenerValor(datos, 'ResiduoId', 'residuoId', 'idResiduo', 'IdResiduo', 'ResiduoID')
  const residuoId = residuoIdRaw ? String(residuoIdRaw) : null

  return {
    id: docSnap.id,
    residuo: String(obtenerValor(datos, CAMPOS.residuo, 'Residuo', 'residuo') ?? 'Residuo'),
    puntos: Number(obtenerValor(datos, CAMPOS.puntos, 'Puntos', 'puntosGanados')) || 0,
    fecha: aFecha(obtenerValor(datos, CAMPOS.fecha, 'fecha')),
    categoria,
    residuoId,
  }
}

export interface ResultadoReciclajesPaginado {
  items: Reciclaje[]
  nextCursor: QueryDocumentSnapshot<DocumentData> | null
  hayMas: boolean
}

export async function obtenerUltimosReciclajes(
  uid: string,
  cantidad = 10,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<ResultadoReciclajesPaginado> {
  let consulta = query(
    collection(db, COLECCION_RECICLAJES),
    where(CAMPOS.uid, '==', uid),
    orderBy(CAMPOS.fecha, 'desc'),
    limit(cantidad + 1),
  )

  if (cursor) {
    consulta = query(
      collection(db, COLECCION_RECICLAJES),
      where(CAMPOS.uid, '==', uid),
      orderBy(CAMPOS.fecha, 'desc'),
      startAfter(cursor),
      limit(cantidad + 1),
    )
  }

  const snapshot = await getDocs(consulta)
  const docs = snapshot.docs
  const hayMas = docs.length > cantidad
  const docsAMostrar = hayMas ? docs.slice(0, cantidad) : docs
  const items = docsAMostrar.map((docSnap) => aReciclaje(docSnap))
  const nextCursor = hayMas && docsAMostrar.length > 0 ? docsAMostrar[docsAMostrar.length - 1] : null

  return { items, nextCursor, hayMas }
}

export async function obtenerUltimosReciclajesSimple(uid: string, cantidad = 10): Promise<Reciclaje[]> {
  const resultado = await obtenerUltimosReciclajes(uid, cantidad, null)
  return resultado.items
}
