import { useEffect, useState } from 'react'

/**
 * Segundos que faltan hasta `vence`. Se calcula en cada render con la hora actual
 * (así nunca hay un instante con un valor viejo) y se vuelve a dibujar cada segundo.
 * Llega a 0 y se queda ahí.
 */
export function useSegundosRestantes(vence: Date | null): number {
  const [, setLatido] = useState(0)

  useEffect(() => {
    if (!vence) return

    const intervalo = setInterval(() => setLatido((n) => n + 1), 1000)
    return () => clearInterval(intervalo)
  }, [vence])

  return vence ? Math.max(0, Math.ceil((vence.getTime() - Date.now()) / 1000)) : 0
}
