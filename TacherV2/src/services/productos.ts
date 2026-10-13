import { collection, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from 'src/firebase'
import type { Producto } from 'src/types'

const COLECCION_PRODUCTOS = 'PRODUCTOS'

/** Nombres de los campos en Firestore. Si en tu base se llaman distinto, cambialos acá. */
const CAMPOS = {
  imagen: 'Imagen',
  nombre: 'Nombre',
  puntos: 'Puntos-Valor',
  descripcion: 'Descripcion',
  disponible: 'Disponible',
  categoria: 'Categoria',
} as const

function esVerdadero(valor: unknown): boolean {
  if (typeof valor === 'string') {
    return ['true', 'si', 'sí', '1'].includes(valor.trim().toLowerCase())
  }
  return Boolean(valor)
}

function aProducto(docSnap: { id: string; data: () => DocumentData }): Producto {
  const datos = docSnap.data()
  const imagen = String(datos[CAMPOS.imagen] ?? '').trim()

  return {
    id: docSnap.id,
    nombre: String(datos[CAMPOS.nombre] ?? 'Producto sin nombre'),
    puntos: Number(datos[CAMPOS.puntos]) || 0,
    descripcion: String(datos[CAMPOS.descripcion] ?? '').trim(),
    categoria: String(datos[CAMPOS.categoria] ?? '').trim(),
    imagen: imagen || null,
    disponible: esVerdadero(datos[CAMPOS.disponible]),
  }
}

/** Productos marcados como disponibles, ordenados del que menos puntos vale al que más. */
export async function obtenerProductosDisponibles(): Promise<Producto[]> {
  const snapshot = await getDocs(collection(db, COLECCION_PRODUCTOS))

  return snapshot.docs
    .map(aProducto)
    .filter((producto) => producto.disponible)
    .sort((a, b) => a.puntos - b.puntos || a.nombre.localeCompare(b.nombre))
}
