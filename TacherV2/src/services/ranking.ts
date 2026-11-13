import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from 'src/firebase'
import { NIVELES } from 'src/domain/niveles'

const COLECCION_USUARIOS = 'USUARIOS'

export interface PuestoRanking {
  id: string
  nombre: string
  reciclajes: number
  cantidad?: number
  puntos: number
  nivel: string
}

export async function obtenerTopRecicladores(limite = 50): Promise<PuestoRanking[]> {
  const consulta = query(
    collection(db, COLECCION_USUARIOS),
    orderBy('reciclajes', 'desc'),
  )

  const snapshot = await getDocs(consulta)
  const puestos = snapshot.docs
    .map((docSnap, indice) => {
      const datos = docSnap.data()
      const reciclajes = Number(datos.reciclajes ?? datos.Reciclajes ?? 0) || 0
      const puntos = Number(datos.Puntos ?? datos.puntos ?? 0) || 0
      const nombre = String(datos.Nombre ?? datos.nombre ?? 'Usuario')
      const nivel = String(datos.Rango ?? datos.rango ?? NIVELES[0].name)
      return {
        id: docSnap.id,
        nombre,
        reciclajes,
        cantidad: reciclajes,
        puntos,
        nivel,
        _indice: indice,
      }
    })
    .filter((puesto) => puesto.reciclajes > 0)
    .sort((a, b) => {
      if (b.reciclajes !== a.reciclajes) return b.reciclajes - a.reciclajes
      if (b.puntos !== a.puntos) return b.puntos - a.puntos
      return a._indice - b._indice
    })
    .slice(0, limite)

  return puestos.map(({ _indice, cantidad, ...puesto }) => ({ ...puesto, cantidad: puesto.reciclajes }))
}
