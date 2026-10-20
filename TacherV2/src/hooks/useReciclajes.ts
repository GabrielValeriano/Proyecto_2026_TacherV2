import { useDatosConCache } from 'src/hooks/useDatosConCache'
import { obtenerUltimosReciclajes, type Reciclaje } from 'src/services/reciclajes'
import { CLAVES } from 'src/utils/cache'

export function useReciclajes(uid?: string) {
  const { datos, cargando, error } = useDatosConCache<Reciclaje[]>(
    uid ? CLAVES.reciclajes(uid) : null,
    () => obtenerUltimosReciclajes(uid ?? ''),
    [],
    'No se pudo cargar tu historial. Intentalo de nuevo más tarde.',
  )

  return { reciclajes: datos, cargando, error }
}
