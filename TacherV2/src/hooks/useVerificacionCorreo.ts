import { useEffect, useRef, useState } from 'react'
import { comprobarEmailVerificado, enviarCorreoDeVerificacion } from 'src/services/autenticacion'
import { mensajeDeError } from 'src/utils/errores'

const INTERVALO_COMPROBACION_MS = 4000
const ESPERA_REENVIO_SEGUNDOS = 60

/**
 * Verificación del correo con el link de Firebase: manda el correo al entrar,
 * comprueba cada pocos segundos si el usuario ya tocó el link y llama a `onVerificado`.
 */
export function useVerificacionCorreo(onVerificado: () => void) {
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [comprobando, setComprobando] = useState(false)
  const [esperaReenvio, setEsperaReenvio] = useState(0)

  const onVerificadoRef = useRef(onVerificado)
  onVerificadoRef.current = onVerificado
  const yaVerificado = useRef(false)

  const enviarCorreo = async () => {
    setError('')
    setAviso('')
    try {
      await enviarCorreoDeVerificacion()
      setAviso('Te enviamos el correo. Revisá también la carpeta de spam.')
      setEsperaReenvio(ESPERA_REENVIO_SEGUNDOS)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar el correo de verificación.'))
    }
  }

  /** `manual` = el usuario tocó el botón: ahí sí mostramos errores. */
  const comprobar = async (manual: boolean) => {
    if (yaVerificado.current) return
    if (manual) {
      setError('')
      setComprobando(true)
    }

    try {
      if (await comprobarEmailVerificado()) {
        yaVerificado.current = true
        onVerificadoRef.current()
      } else if (manual) {
        setError('Todavía no verificaste tu correo. Abrí el link que te enviamos e intentá de nuevo.')
      }
    } catch (err) {
      console.error('Error al comprobar la verificación del correo:', err)
      if (manual) setError('No se pudo comprobar la verificación. Revisá tu conexión.')
    } finally {
      if (manual) setComprobando(false)
    }
  }

  // Al entrar: si ya estaba verificado seguimos de largo; si no, mandamos el correo
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        if (await comprobarEmailVerificado()) {
          if (!cancelado && !yaVerificado.current) {
            yaVerificado.current = true
            onVerificadoRef.current()
          }
          return
        }
      } catch (err) {
        console.error('Error al comprobar la verificación del correo:', err)
      }
      if (!cancelado) await enviarCorreo()
    })()

    return () => {
      cancelado = true
    }
  }, [])

  // Mientras la pantalla está abierta, comprueba cada pocos segundos
  useEffect(() => {
    const intervalo = setInterval(() => comprobar(false), INTERVALO_COMPROBACION_MS)
    return () => clearInterval(intervalo)
  }, [])

  // Cuenta regresiva para poder volver a reenviar
  useEffect(() => {
    if (esperaReenvio <= 0) return
    const temporizador = setTimeout(() => setEsperaReenvio((segundos) => segundos - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [esperaReenvio])

  return {
    error,
    aviso,
    comprobando,
    esperaReenvio,
    reenviar: enviarCorreo,
    comprobarAhora: () => comprobar(true),
  }
}
