import { useEffect, useState } from 'react'
import { obtenerProductosDisponibles } from 'src/services/productos'
import type { Producto } from 'src/types'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    obtenerProductosDisponibles()
      .then((resultado) => {
        if (!cancelado) setProductos(resultado)
      })
      .catch((err) => {
        console.error('Error al cargar los productos:', err)
        if (!cancelado) setError('No se pudieron cargar los productos. Intentalo de nuevo más tarde.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { productos, cargando, error }
}
