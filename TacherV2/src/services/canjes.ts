import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from 'src/firebase'
import type { Canje, CanjePendiente, Producto, ValidacionCanje } from 'src/types'

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

/**
 * Busca los canjes FINALIZADOS del usuario por nombre y devuelve el más reciente.
 * Los canjes viejos cargados a mano, sin el campo Validacion, cuentan como finalizados.
 */
export async function obtenerUltimoCanje(nombreUsuario: string): Promise<Canje | null> {
  const consulta = query(canjesRef(), where(CAMPOS.usuario, '==', nombreUsuario))
  const snapshot = await getDocs(consulta)

  const canjes = snapshot.docs
    .filter((docSnap) => {
      const validacion = docSnap.data()[CAMPOS.validacion]
      return validacion === undefined || validacion === 'finalizado'
    })
    .map(aCanje)

  canjes.sort((a, b) => enMilisegundos(b.fecha) - enMilisegundos(a.fecha))
  return canjes[0] ?? null
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
  const ref = doc(canjesRef()) // el id lo genera Firestore: al azar e imposible de adivinar
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

/**
 * Devuelve el canje pendiente y vigente de este usuario para este producto,
 * o crea uno nuevo. Cualquier otro pendiente del usuario se cancela
 * (un solo QR activo por persona).
 */
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
    const vence = aFecha(campos[CAMPOS.vence])

    if (
      !reutilizable &&
      vence instanceof Date &&
      vence.getTime() > ahora &&
      campos[CAMPOS.productoId] === datos.producto.id
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

/** Avisa en tiempo real cada vez que cambia la Validacion del canje (por ejemplo, cuando el cajero lo finaliza). */
export function escucharValidacionCanje(
  id: string,
  onChange: (validacion: ValidacionCanje | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    canjeRef(id),
    (snap) => {
      onChange(snap.exists() ? (snap.data()[CAMPOS.validacion] as ValidacionCanje) : null)
    },
    onError,
  )
}
