import { useEffect, useState } from 'react'
import { obtenerTopRecicladores, type PuestoRanking } from 'src/services/ranking'

export function useRanking() {
  const [puestos, setPuestos] = useState<PuestoRanking[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    obtenerTopRecicladores()
      .then((resultado) => {
        if (!cancelado) setPuestos(resultado)
      })
      .catch((err) => {
        console.error('Error al cargar el ranking:', err)
        if (!cancelado) setError('No se pudo cargar el ranking. Intentalo de nuevo más tarde.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { puestos, cargando, error }
}
