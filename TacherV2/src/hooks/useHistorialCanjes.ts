import { useDatosConCache } from 'src/hooks/useDatosConCache'
import { obtenerHistorialCanjesSimple, type CanjeHistorial } from 'src/services/canjes'

export function useHistorialCanjes(uid?: string) {
  const { datos, cargando, error } = useDatosConCache<CanjeHistorial[]>(
    uid ? `historial-canjes:${uid}` : null,
    () => obtenerHistorialCanjesSimple(uid ?? ''),
    [],
    'No se pudo cargar tu historial de canjes. Intentalo de nuevo más tarde.',
  )

  return { canjes: datos, cargando, error }
}
