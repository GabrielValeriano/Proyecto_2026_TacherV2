import { useCallback, useEffect, useState } from 'react'
import {
  cancelarCanje,
  escucharValidacionCanje,
  obtenerOCrearCanjePendiente,
} from 'src/services/canjes'
import type { CanjePendiente, Producto, Usuario } from 'src/types'

/**
 * Maneja el ciclo de vida del QR de un canje: lo crea (o reutiliza el vigente),
 * avisa cuando el cajero lo finaliza y permite cancelarlo o generar uno nuevo.
 */
export function useCanjeQr(producto: Producto | null, usuario: Usuario | null) {
  const [canje, setCanje] = useState<CanjePendiente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [finalizado, setFinalizado] = useState(false)
  const [intento, setIntento] = useState(0)

  // Solo los ids como dependencia: si los puntos del usuario cambian
  // (por ejemplo, tras el canje) no se debe generar otro QR.
  const productoId = producto?.id
  const uid = usuario?.id

  useEffect(() => {
    if (!producto || !usuario) return

    if ((Number(usuario.Puntos) || 0) < producto.puntos) {
      setCanje(null)
      setCargando(false)
      setError('No te alcanzan los puntos para canjear este producto.')
      return
    }

    let cancelado = false
    setCargando(true)
    setError('')
    setCanje(null)

    obtenerOCrearCanjePendiente({ uid: usuario.id, nombreUsuario: usuario.Nombre, producto })
      .then((resultado) => {
        if (!cancelado) setCanje(resultado)
      })
      .catch((err) => {
        console.error('Error al generar el QR:', err)
        if (!cancelado) setError('No se pudo generar el QR. Intentalo de nuevo.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [productoId, uid, intento])

  useEffect(() => {
    if (!canje) return

    return escucharValidacionCanje(
      canje.id,
      (validacion) => {
        if (validacion === 'finalizado') setFinalizado(true)
      },
      (err) => console.error('Error escuchando el canje:', err),
    )
  }, [canje?.id])

  const cancelar = useCallback(async () => {
    if (!canje) return
    try {
      await cancelarCanje(canje.id)
    } catch (err) {
      // Si falla, el QR igual vence solo a los pocos minutos
      console.error('Error al cancelar el canje:', err)
    }
  }, [canje])

  return {
    canje,
    cargando,
    error,
    finalizado,
    cancelar,
    regenerar: () => setIntento((n) => n + 1),
  }
}
