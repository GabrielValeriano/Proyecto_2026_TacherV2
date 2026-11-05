import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from 'src/firebase'
import type { Canje, CanjePendiente, Producto, ValidacionCanje } from 'src/types'
import { obtenerProductosDisponibles } from 'src/services/productos'

const COLECCION_CANJES = 'CANJES'

/** Cuánto tiempo sirve un QR antes de vencer. */
const DURACION_QR_MS = 5 * 60 * 1000

/** Nombres de los campos en Firestore. Si en tu base se llaman distinto, cambialos acá. */
const CAMPOS = {
  usuario: 'Usuario',
  uid: 'Uid',
  producto: 'Producto',
  productoId: 'ProductoId',
  puntosCanjeados: 'PuntosCanjeados',
  validacion: 'Validacion',
  codigo: 'Codigo',
  fecha: 'Fecha',
  vence: 'Vence',
} as const

const canjesRef = () => collection(db, COLECCION_CANJES)
const canjeRef = (id: string) => doc(db, COLECCION_CANJES, id)

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

function obtenerValor(datos: DocumentData, ...claves: string[]) {
  for (const clave of claves) {
    if (datos[clave] !== undefined && datos[clave] !== null) {
      return datos[clave]
    }
  }
  return undefined
}

function aCanje(docSnap: { id: string; data: () => DocumentData }): Canje {
  const datos = docSnap.data()
  return {
    id: docSnap.id,
    producto: String(obtenerValor(datos, CAMPOS.producto) ?? '—'),
    puntosCanjeados: Number(obtenerValor(datos, CAMPOS.puntosCanjeados)) || 0,
    codigo: String(obtenerValor(datos, CAMPOS.codigo) ?? '—'),
    fecha: aFecha(obtenerValor(datos, CAMPOS.fecha)),
  }
}

export interface CanjeHistorial {
  id: string
  producto: string
  productoId?: string
  puntosCanjeados: number
  codigo: string
  fecha: Date | string | null
  imagen?: string | null
}

const enMilisegundos = (fecha: Date | string | null) => (fecha instanceof Date ? fecha.getTime() : 0)

export interface ResultadoCanjesPaginado {
  items: CanjeHistorial[]
  nextCursor: QueryDocumentSnapshot<DocumentData> | null
  hayMas: boolean
}

export async function obtenerUltimoCanje(nombreUsuario: string): Promise<Canje | null> {
  const consulta = query(canjesRef(), where(CAMPOS.usuario, '==', nombreUsuario))
  const snapshot = await getDocs(consulta)

  const canjes = snapshot.docs
    .filter((docSnap) => {
      const validacion = obtenerValor(docSnap.data(), CAMPOS.validacion)
      return validacion === undefined || validacion === null || validacion === 'finalizado'
    })
    .map(aCanje)

  canjes.sort((a, b) => enMilisegundos(b.fecha) - enMilisegundos(a.fecha))
  return canjes[0] ?? null
}

function aCanjeHistorial(docSnap: { id: string; data: () => DocumentData }): CanjeHistorial {
  const datos = docSnap.data()
  const productoId = obtenerValor(datos, CAMPOS.productoId)
  return {
    id: docSnap.id,
    producto: String(obtenerValor(datos, CAMPOS.producto) ?? '—'),
    productoId: productoId ? String(productoId) : undefined,
    puntosCanjeados: Number(obtenerValor(datos, CAMPOS.puntosCanjeados)) || 0,
    codigo: String(obtenerValor(datos, CAMPOS.codigo) ?? '—'),
    fecha: aFecha(obtenerValor(datos, CAMPOS.fecha)),
  }
}

async function agregarImagenes(canjes: CanjeHistorial[]): Promise<CanjeHistorial[]> {
  try {
    const productos = await obtenerProductosDisponibles()
    const mapa = new Map(productos.map((producto) => [producto.id, producto.imagen]))
    return canjes.map((canje) => ({
      ...canje,
      imagen: canje.productoId ? mapa.get(canje.productoId) ?? null : null,
    }))
  } catch (error) {
    console.error('Error al resolver imágenes del historial de canjes:', error)
    return canjes
  }
}

async function obtenerDocsPorUid(uid: string) {
  const consulta = query(
    canjesRef(),
    where(CAMPOS.uid, '==', uid),
    orderBy(CAMPOS.fecha, 'desc'),
  )
  const snapshot = await getDocs(consulta)
  return snapshot.docs
}

export async function obtenerHistorialCanjes(uid: string, cantidad = 20): Promise<CanjeHistorial[]> {
  const docs = await obtenerDocsPorUid(uid)

  const canjes = docs
    .filter((docSnap) => {
      const validacion = obtenerValor(docSnap.data(), CAMPOS.validacion)
      return validacion === undefined || validacion === null || validacion === 'finalizado'
    })
    .map(aCanjeHistorial)
    .slice(0, cantidad)

  return agregarImagenes(canjes)
}

export async function obtenerHistorialCanjesPaginado(
  uid: string,
  cantidad = 10,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<ResultadoCanjesPaginado> {
  const docs = await obtenerDocsPorUid(uid)

  let docsFiltrados = docs.filter((docSnap) => {
    const validacion = obtenerValor(docSnap.data(), CAMPOS.validacion)
    return validacion === undefined || validacion === null || validacion === 'finalizado'
  })

  if (cursor) {
    const cursorIndex = docsFiltrados.findIndex((docSnap) => docSnap.id === cursor.id)
    if (cursorIndex >= 0) {
      docsFiltrados = docsFiltrados.slice(cursorIndex + 1)
    }
  }

  const hayMas = docsFiltrados.length > cantidad
  const docsAMostrar = hayMas ? docsFiltrados.slice(0, cantidad) : docsFiltrados
  const canjesBase = docsAMostrar.map(aCanjeHistorial)
  const canjes = await agregarImagenes(canjesBase)
  const nextCursor = hayMas && docsAMostrar.length > 0 ? docsAMostrar[docsAMostrar.length - 1] : null

  return { items: canjes, nextCursor, hayMas }
}

export async function obtenerHistorialCanjesSimple(uid: string, cantidad = 20): Promise<CanjeHistorial[]> {
  return obtenerHistorialCanjes(uid, cantidad)
}

// ---------------------------------------------------------------------------
// Canje con QR
// ---------------------------------------------------------------------------

interface DatosNuevoCanje {
  uid: string
  nombreUsuario: string
  producto: Producto
}

export function cancelarCanje(id: string): Promise<void> {
  return updateDoc(canjeRef(id), { [CAMPOS.validacion]: 'cancelado' satisfies ValidacionCanje })
}

async function crearCanjePendiente({
  uid,
  nombreUsuario,
  producto,
}: DatosNuevoCanje): Promise<CanjePendiente> {
  const ref = doc(canjesRef())
  const vence = new Date(Date.now() + DURACION_QR_MS)

  await setDoc(ref, {
    [CAMPOS.usuario]: nombreUsuario,
    [CAMPOS.uid]: uid,
    [CAMPOS.producto]: producto.nombre,
    [CAMPOS.productoId]: producto.id,
    [CAMPOS.puntosCanjeados]: producto.puntos,
    [CAMPOS.validacion]: 'pendiente' satisfies ValidacionCanje,
    [CAMPOS.codigo]: ref.id,
    [CAMPOS.fecha]: serverTimestamp(),
    [CAMPOS.vence]: Timestamp.fromDate(vence),
  })

  return { id: ref.id, vence }
}

export async function obtenerOCrearCanjePendiente(datos: DatosNuevoCanje): Promise<CanjePendiente> {
  const consulta = query(
    canjesRef(),
    where(CAMPOS.uid, '==', datos.uid),
    where(CAMPOS.validacion, '==', 'pendiente'),
  )
  const pendientes = await getDocs(consulta)
  const ahora = Date.now()

  let reutilizable: CanjePendiente | null = null
  const idsACancelar: string[] = []

  for (const docSnap of pendientes.docs) {
    const campos = docSnap.data()
    const vence = aFecha(obtenerValor(campos, CAMPOS.vence))

    if (
      !reutilizable &&
      vence instanceof Date &&
      vence.getTime() > ahora &&
      obtenerValor(campos, CAMPOS.productoId) === datos.producto.id
    ) {
      reutilizable = { id: docSnap.id, vence }
    } else {
      idsACancelar.push(docSnap.id)
    }
  }

  await Promise.all(
    idsACancelar.map((id) =>
      cancelarCanje(id).catch((error) => console.error('Error al cancelar un canje viejo:', error)),
    ),
  )

  return reutilizable ?? crearCanjePendiente(datos)
}

export function escucharValidacionCanje(
  id: string,
  onChange: (validacion: ValidacionCanje | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    canjeRef(id),
    (snap) => {
      const validacion = obtenerValor(snap.data() || {}, CAMPOS.validacion)
      onChange(snap.exists() ? (validacion as ValidacionCanje) : null)
    },
    onError,
  )
}
