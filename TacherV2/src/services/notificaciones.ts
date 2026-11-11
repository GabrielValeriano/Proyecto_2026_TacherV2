import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from 'src/firebase'
import type { Notificacion, TipoNotificacion } from 'src/types'

/**
 * Subcolección USUARIOS/{uid}/NOTIFICACIONES. Cada documento tiene:
 *   Tipo: 'reciclaje' | 'canje'   Titulo: string   Mensaje: string
 *   Fecha: timestamp              Leida: boolean
 * La app solo lee y marca como leídas; las crean el backend de la caja y la app del cajero.
 */
const SUBCOLECCION = 'NOTIFICACIONES'
const MAXIMO_A_MOSTRAR = 50

const notificacionesRef = (uid: string) => collection(db, 'USUARIOS', uid, SUBCOLECCION)

const TIPOS_CONOCIDOS: TipoNotificacion[] = ['reciclaje', 'canje']

function aNotificacion(docSnap: { id: string; data: () => DocumentData }): Notificacion {
  const datos = docSnap.data()
  const fecha = datos.Fecha?.toDate?.() ?? null
  return {
    id: docSnap.id,
    tipo: TIPOS_CONOCIDOS.includes(datos.Tipo) ? datos.Tipo : 'general',
    titulo: String(datos.Titulo ?? 'Notificación'),
    mensaje: String(datos.Mensaje ?? ''),
    fecha: fecha instanceof Date ? fecha : null,
    leida: datos.Leida === true,
  }
}

/** Escucha en tiempo real las últimas notificaciones del usuario, de la más nueva a la más vieja. */
export function escucharNotificaciones(
  uid: string,
  onChange: (notificaciones: Notificacion[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const consulta = query(notificacionesRef(uid), orderBy('Fecha', 'desc'), limit(MAXIMO_A_MOSTRAR))
  // serverTimestamps 'estimate': una notificación recién creada se ordena bien antes de que confirme el servidor
  return onSnapshot(
    consulta,
    (snapshot) =>
      onChange(
        snapshot.docs.map((docSnap) =>
          aNotificacion({ id: docSnap.id, data: () => docSnap.data({ serverTimestamps: 'estimate' }) }),
        ),
      ),
    onError,
  )
}

export async function marcarComoLeidas(uid: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const lote = writeBatch(db)
  for (const id of ids) lote.update(doc(notificacionesRef(uid), id), { Leida: true })
  await lote.commit()
}
