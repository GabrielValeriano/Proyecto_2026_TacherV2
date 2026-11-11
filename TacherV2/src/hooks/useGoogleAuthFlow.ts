import { useState } from 'react'
import { isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin'
import { useApp } from 'src/context/AppContext'
import { cerrarSesionFirebase } from 'src/services/autenticacion'
import { autenticarConGoogle, type CuentaGoogle } from 'src/services/googleAuth'
import { existePerfil } from 'src/services/usuarios'

type AlFallar = (mensaje: string) => void

const MENSAJE_GENERICO = 'Ocurrió un problema de conexión. Intentá de nuevo.'

/** Mensaje para el usuario, o null si no hay que mostrar nada (canceló o ya había uno en curso). */
function mensajeParaUsuario(error: unknown): string | null {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) return null
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return 'Necesitás tener Google Play Services actualizado para entrar con Google.'
    }
  }
  return MENSAJE_GENERICO
}

export function useGoogleAuthFlow() {
  const { navigate, setUserDocId, actualizarFlowData } = useApp()
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const conCuentaGoogle = async (
    alFallar: AlFallar,
    accion: (cuenta: CuentaGoogle) => Promise<void>,
  ) => {
    setLoadingGoogle(true)
    try {
      const cuenta = await autenticarConGoogle()
      if (!cuenta) return // Cerró el selector de cuentas: no es un error
      await accion(cuenta)
    } catch (error) {
      // El detalle técnico queda en los logs; al usuario le mostramos algo entendible
      console.error('Error en autenticación con Google:', error)
      const mensaje = mensajeParaUsuario(error)
      if (mensaje) alFallar(mensaje)
    } finally {
      setLoadingGoogle(false)
    }
  }

  const registrarConGoogle = (alFallar: AlFallar) =>
    conCuentaGoogle(alFallar, async ({ uid, email, nombre }) => {
      if (await existePerfil(uid)) {
        await cerrarSesionFirebase()
        return alFallar('Esta cuenta de Google ya está registrada. Por favor, iniciá sesión.')
      }

      actualizarFlowData({ email, nombre, proveedor: 'google.com' })
      navigate('confirm-scan')
    })

  const iniciarSesionConGoogle = (alFallar: AlFallar) =>
    conCuentaGoogle(alFallar, async ({ uid }) => {
      if (!(await existePerfil(uid))) {
        await cerrarSesionFirebase()
        return alFallar('Esta cuenta de Google no está registrada. Por favor, registrate primero.')
      }

      setUserDocId(uid)
      navigate('home')
    })

  return { registrarConGoogle, iniciarSesionConGoogle, loadingGoogle }
}
