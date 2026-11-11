import { useEffect, useRef, useState } from 'react'
import { useSegundosRestantes } from 'src/hooks/useSegundosRestantes'
import { enviarCodigoRegistro, verificarCodigoRegistro } from 'src/services/verificacionRegistro'

const ESPERA_REENVIO_SEGUNDOS = 60

const enSegundos = (segundos: number) => new Date(Date.now() + segundos * 1000)

/**
 * Verificación del correo con un código de 8 dígitos: al entrar le pide al backend que mande
 * el código (si el mail ya estaba verificado, llama a `onVerificado` de una), y `verificar`
 * lo valida contra el backend.
 */
export function useVerificacionCorreo(onVerificado: () => void) {
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(true)
  const [verificando, setVerificando] = useState(false)
  const [puedeReenviarEn, setPuedeReenviarEn] = useState<Date | null>(null)
  const esperaReenvio = useSegundosRestantes(puedeReenviarEn)

  const onVerificadoRef = useRef(onVerificado)
  onVerificadoRef.current = onVerificado
  const yaVerificado = useRef(false)

  const terminar = () => {
    if (yaVerificado.current) return
    yaVerificado.current = true
    onVerificadoRef.current()
  }

  /** `reenvio` = el usuario tocó "Reenviar": el código anterior deja de servir. */
  const enviarCodigo = async (reenvio: boolean) => {
    setError('')
    setAviso('')
    setEnviando(true)
    const resultado = await enviarCodigoRegistro()
    setEnviando(false)

    if (!resultado.ok) return setError(resultado.mensaje)
    if (resultado.yaVerificado) return terminar()

    setPuedeReenviarEn(enSegundos(resultado.segundosParaReenviar ?? ESPERA_REENVIO_SEGUNDOS))
    if (resultado.enviado === false) {
      setAviso('Ya te enviamos un código hace un momento. Revisá tu correo y la carpeta de spam.')
    } else {
      setAviso(
        reenvio
          ? 'Te enviamos un código nuevo. El anterior ya no sirve.'
          : 'Te enviamos el código. Revisá también la carpeta de spam.',
      )
    }
  }

  // Al entrar se pide el código (o se sigue de largo si el correo ya estaba verificado)
  useEffect(() => {
    enviarCodigo(false)
  }, [])

  const verificar = async (codigo: string): Promise<boolean> => {
    setError('')
    setAviso('')
    setVerificando(true)
    const resultado = await verificarCodigoRegistro(codigo)
    setVerificando(false)

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return false
    }
    terminar()
    return true
  }

  return {
    error,
    aviso,
    enviando,
    verificando,
    esperaReenvio,
    limpiarError: () => setError(''),
    reenviar: () => enviarCodigo(true),
    verificar,
  }
}
