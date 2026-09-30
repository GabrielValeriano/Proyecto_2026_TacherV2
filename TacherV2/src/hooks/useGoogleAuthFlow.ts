import { useState } from 'react'
import { useApp } from 'src/context/AppContext'
import { cerrarSesionFirebase } from 'src/services/autenticacion'
import { autenticarConGoogle, type CuentaGoogle } from 'src/services/googleAuth'
import { existePerfil } from 'src/services/usuarios'

type AlFallar = (mensaje: string) => void

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
      if (!cuenta) return alFallar('No se pudo obtener el token de autenticación.')
      await accion(cuenta)
    } catch (error) {
      console.error('Error en autenticación nativa de Google:', error)
      const codigo = (error as { code?: string }).code
      if (codigo !== 'ASYNC_OP_IN_PROGRESS') {
        alFallar('No se pudo completar el inicio de sesión con Google.')
      }
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

      // El perfil se crea recién después de escanear el DNI y elegir nombre
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
