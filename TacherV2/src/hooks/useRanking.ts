import { useDatosConCache } from 'src/hooks/useDatosConCache'
import { obtenerTopRecicladores, type PuestoRanking } from 'src/services/ranking'
import { CLAVES } from 'src/utils/cache'

export function useRanking() {
  const { datos, cargando, error } = useDatosConCache<PuestoRanking[]>(
    CLAVES.ranking,
    () => obtenerTopRecicladores(),
    [],
    'No se pudo cargar el ranking. Intentalo de nuevo más tarde.',
  )

  return { puestos: datos, cargando, error }
}
