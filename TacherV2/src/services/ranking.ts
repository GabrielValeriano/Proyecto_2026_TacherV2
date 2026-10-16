import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from 'src/firebase'

export interface PuestoRanking {
  /** Es el uid del usuario. */
  id: string
  nombre: string
  cantidad: number
}

/**
 * Un documento por usuario (id = uid) con solo datos públicos.
 * No se usa USUARIOS porque ahí hay datos privados (DNI, correo).
 */
const COLECCION_RANKING = 'RANKING'

/** Nombres de los campos en Firestore. Si en tu base se llaman distinto, cambialos acá. */
const CAMPOS = {
  nombre: 'Nombre',
  cantidad: 'Reciclajes',
} as const

export async function obtenerTopRecicladores(cantidad = 10): Promise<PuestoRanking[]> {
  const consulta = query(
    collection(db, COLECCION_RANKING),
    orderBy(CAMPOS.cantidad, 'desc'),
    limit(cantidad),
  )
  const snapshot = await getDocs(consulta)

  return snapshot.docs
    .map((docSnap) => {
      const datos = docSnap.data()
      return {
        id: docSnap.id,
        nombre: String(datos[CAMPOS.nombre] ?? 'Reciclador'),
        cantidad: Number(datos[CAMPOS.cantidad]) || 0,
      }
    })
    .filter((puesto) => puesto.cantidad > 0)
}
