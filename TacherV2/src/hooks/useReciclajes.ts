import { useEffect, useState } from 'react'
import { obtenerUltimosReciclajes, type Reciclaje } from 'src/services/reciclajes'

export function useReciclajes(uid?: string) {
  const [reciclajes, setReciclajes] = useState<Reciclaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid) return

    let cancelado = false
    setCargando(true)
    setError('')

    obtenerUltimosReciclajes(uid)
      .then((resultado) => {
        if (!cancelado) setReciclajes(resultado)
      })
      .catch((err) => {
        console.error('Error al cargar los reciclajes:', err)
        if (!cancelado) setError('No se pudo cargar tu historial. Intentalo de nuevo más tarde.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [uid])

  return { reciclajes, cargando, error }
}
