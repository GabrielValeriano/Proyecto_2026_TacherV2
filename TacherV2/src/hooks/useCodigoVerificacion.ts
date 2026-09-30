import { useEffect, useState } from 'react'
import {
  enviarCodigoVerificacion,
  generarCodigoVerificacion,
} from 'src/services/verificacionEmail'
import { mensajeDeError } from 'src/utils/errores'

/** Genera y envía un código al email dado, y permite verificar el que ingresa el usuario. */
export function useCodigoVerificacion(email?: string) {
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const enviarNuevoCodigo = async () => {
    if (!email) return

    const codigo = generarCodigoVerificacion()
    setCodigoGenerado(codigo)
    setError('')
    setEnviando(true)
    try {
      await enviarCodigoVerificacion(email, codigo)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar el correo de verificación.'))
    } finally {
      setEnviando(false)
    }
  }

  useEffect(() => {
    enviarNuevoCodigo()
  }, [email])

  const verificar = (codigoIngresado: string): boolean => {
    const esCorrecto = codigoGenerado !== '' && codigoIngresado.trim() === codigoGenerado
    setError(
      esCorrecto ? '' : 'El código ingresado es incorrecto. Verificá e intentá de nuevo.',
    )
    return esCorrecto
  }

  return {
    enviando,
    error,
    limpiarError: () => setError(''),
    reenviar: enviarNuevoCodigo,
    verificar,
  }
}
