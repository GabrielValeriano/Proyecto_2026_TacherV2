import { useEffect, useState } from 'react'
import type { TotalesHistorial } from 'src/services/reciclajes'

/**
 * Carga los totales de un historial (cantidad y puntos) para el resumen de arriba.
 * `recargar` es cualquier valor que, al cambiar, vuelve a pedirlos (por ejemplo, al refrescar).
 * Si falla, devuelve null y el resumen muestra "—".
 */
export function useTotalesHistorial(
  obtener: (uid: string) => Promise<TotalesHistorial>,
  uid?: string,
  recargar?: unknown,
): TotalesHistorial | null {
  const [totales, setTotales] = useState<TotalesHistorial | null>(null)

  useEffect(() => {
    if (!uid) return
    let activo = true
    obtener(uid)
      .then((resultado) => {
        if (activo) setTotales(resultado)
      })
      .catch((error) => console.error('No se pudieron calcular los totales del historial:', error))
    return () => {
      activo = false
    }
  }, [obtener, uid, recargar])

  return totales
}
