import { useEffect, useState } from 'react'
import { cargarYGuardar, estaFresco, leerCache } from 'src/utils/cache'

/**
 * Carga datos con caché:
 *  - si ya hay datos guardados, se muestran al instante (sin "cargando") y se actualizan en segundo plano
 *  - si no hay, `cargando` es true hasta que lleguen
 * Si falla la actualización pero ya había datos en pantalla, se siguen mostrando esos.
 */
export function useDatosConCache<T>(
  clave: string | null,
  cargar: () => Promise<T>,
  valorInicial: T,
  mensajeError: string,
) {
  const [datos, setDatos] = useState<T>(() => {
    const guardados = clave ? leerCache<T>(clave) : undefined
    return guardados !== undefined ? guardados : valorInicial
  })
  const [cargando, setCargando] = useState(() => !(clave && leerCache<T>(clave) !== undefined))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!clave) return

    let cancelado = false
    const guardados = leerCache<T>(clave)
    const hayDatosGuardados = guardados !== undefined

    if (hayDatosGuardados) {
      setDatos(guardados)
      setCargando(false)
      if (estaFresco(clave)) return // recién cargados (por ejemplo, por la precarga)
    } else {
      setCargando(true)
    }

    setError('')
    cargarYGuardar(clave, cargar)
      .then((resultado) => {
        if (!cancelado) setDatos(resultado)
      })
      .catch((err) => {
        console.error(`Error al cargar ${clave}:`, err)
        if (!cancelado && !hayDatosGuardados) setError(mensajeError)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [clave])

  return { datos, cargando, error }
}
