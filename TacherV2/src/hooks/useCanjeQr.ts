import { useState, useEffect } from 'react'
import type { CanjePendiente, Producto, Usuario } from 'src/types'

// Variable en memoria global para que el QR no se pierda al navegar hacia atrás
let canjeMockGlobal: (CanjePendiente & { producto: string; puntosCanjeados: number; codigo: string; fecha: Date }) | null = null

export function useCanjeQr(producto: Producto | null, usuario: Usuario | null) {
  const [canje, setCanje] = useState<CanjePendiente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [finalizado, setFinalizado] = useState(false)

  useEffect(() => {
    if (!producto || !usuario) return

    const ahora = Date.now()

    // 1. Si ya existe un QR guardado y todavía no pasaron los 5 minutos, LO REUTILIZAMOS
    if (canjeMockGlobal && canjeMockGlobal.vence.getTime() > ahora) {
      setCanje(canjeMockGlobal)
      setCargando(false)
      return
    }

    // 2. Si no hay QR o ya venció, creamos uno nuevo con 5 minutos exactos de duración
    const cincoMinutosMs = 5 * 60 * 1000
    const nuevoCanje = {
      id: 'prototipo-qr-' + Math.floor(Math.random() * 10000),
      producto: producto.nombre,
      puntosCanjeados: producto.puntos,
      codigo: 'PROTOTIPO',
      fecha: new Date(),
      vence: new Date(ahora + cincoMinutosMs),
    }

    canjeMockGlobal = nuevoCanje
    setCanje(nuevoCanje)
    setCargando(false)
  }, [producto, usuario])

  // Al cancelar, HACEMOS QUE NO BORRE el QR global. 
  // Así, si el usuario vuelve a entrar, mantiene el mismo código y el tiempo que le queda.
  const cancelar = async () => {
    // No destruimos canjeMockGlobal para que persista
  }

  // Si el usuario presiona "Generar QR nuevo" (porque expiró), ahí sí lo limpiamos para forzar uno nuevo
  const regenerar = () => {
    canjeMockGlobal = null
    if (producto && usuario) {
      const ahora = Date.now()
      const cincoMinutosMs = 5 * 60 * 1000
      const nuevoCanje = {
        id: 'prototipo-qr-' + Math.floor(Math.random() * 10000),
        producto: producto.nombre,
        puntosCanjeados: producto.puntos,
        codigo: 'PROTOTIPO',
        fecha: new Date(),
        vence: new Date(ahora + cincoMinutosMs),
      }
      canjeMockGlobal = nuevoCanje
      setCanje(nuevoCanje)
    }
  }

  return {
    canje,
    cargando,
    error,
    finalizado,
    cancelar,
    regenerar,
  }
}
