import { useDatosConCache } from 'src/hooks/useDatosConCache'
import { obtenerProductosDisponibles } from 'src/services/productos'
import type { Producto } from 'src/types'
import { CLAVES } from 'src/utils/cache'

export function useProductos() {
  const { datos, cargando, error } = useDatosConCache<Producto[]>(
    CLAVES.productos,
    obtenerProductosDisponibles,
    [],
    'No se pudieron cargar los productos. Intentalo de nuevo más tarde.',
  )

  return { productos: datos, cargando, error }
}
