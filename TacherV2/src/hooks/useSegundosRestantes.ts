import { useEffect, useState } from 'react'

/** Segundos que faltan hasta `vence`, actualizados cada segundo. Llega a 0 y se queda ahí. */
export function useSegundosRestantes(vence: Date | null): number {
  const calcular = () => (vence ? Math.max(0, Math.ceil((vence.getTime() - Date.now()) / 1000)) : 0)
  const [segundos, setSegundos] = useState(calcular)

  useEffect(() => {
    setSegundos(calcular())
    if (!vence) return

    const intervalo = setInterval(() => setSegundos(calcular()), 1000)
    return () => clearInterval(intervalo)
  }, [vence])

  return segundos
}
