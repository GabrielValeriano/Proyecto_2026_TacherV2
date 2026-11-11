import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import * as Notifications from 'expo-notifications'
import { cerrarSesionFirebase } from 'src/services/autenticacion'
import { escucharUsuario } from 'src/services/usuarios'
import type { AppContextValue, FlowData, Notificacion, Pantalla, Usuario, Producto } from 'src/types'
import { auth } from 'src/firebase'
import { PantallaCarga } from 'src/Pantallas/PantallaCarga'
import { existePerfil } from 'src/services/usuarios'
import { precargarDatos } from 'src/services/precarga'
import { limpiarCache } from 'src/utils/cache'
import { escucharNotificaciones } from 'src/services/notificaciones'
import {
  configurarNotificaciones,
  destinoDeRespuesta,
  quitarDispositivoDePush,
  registrarDispositivoParaPush,
} from 'src/services/push'

configurarNotificaciones()

const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider')
  return context
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [pantallaActual, setPantallaActual] = useState<Pantalla>('welcome')
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [seccionEnDesarrollo, setSeccionEnDesarrollo] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [userDocId, setUserDocId] = useState<string | null>(null)
  const [userData, setUserData] = useState<Usuario | null>(null)
  const [flowData, setFlowData] = useState<FlowData>({})
  const [mensajeExito, setMensajeExito] = useState('')
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(true)
  const [errorNotificaciones, setErrorNotificaciones] = useState('')
  const ultimaRespuestaPush = Notifications.useLastNotificationResponse()
  const respuestaPushManejada = useRef<string | null>(null)


  // Mantiene userData sincronizado en tiempo real con Firestore
  useEffect(() => {
    if (!userDocId) {
      setUserData(null)
      return
    }
    return escucharUsuario(userDocId, setUserData, (error) =>
      console.error('Error escuchando cambios en tiempo real:', error),
    )
  }, [userDocId])

  useEffect(() => {
      if (userDocId) precargarDatos(userDocId)
    }, [userDocId])

  // Notificaciones en tiempo real: lo que cree la caja o el cajero aparece solo
  useEffect(() => {
    setNotificaciones([])
    setErrorNotificaciones('')
    if (!userDocId) return
    setCargandoNotificaciones(true)
    return escucharNotificaciones(
      userDocId,
      (lista) => {
        setNotificaciones(lista)
        setCargandoNotificaciones(false)
      },
      (error) => {
        console.error('Error escuchando notificaciones:', error)
        setErrorNotificaciones('No se pudieron cargar tus notificaciones.')
        setCargandoNotificaciones(false)
      },
    )
  }, [userDocId])

  // Asocia este teléfono a la cuenta para recibir push
  useEffect(() => {
    if (userDocId) registrarDispositivoParaPush(userDocId)
  }, [userDocId])

  // Tocar un push abre su pantalla. Sirve con la app abierta, en segundo plano o cerrada:
  // en este último caso se espera a que se restaure la sesión antes de navegar.
  useEffect(() => {
    if (!ultimaRespuestaPush || cargandoSesion || !userDocId) return
    const id = ultimaRespuestaPush.notification.request.identifier
    if (respuestaPushManejada.current === id) return
    respuestaPushManejada.current = id
    Notifications.clearLastNotificationResponse()

    const destino = destinoDeRespuesta(ultimaRespuestaPush)
    if (destino) setPantallaActual(destino)
  }, [ultimaRespuestaPush, cargandoSesion, userDocId])

  useEffect(() => {
      let activo = true

      const restaurarSesion = async () => {
        try {
          await auth.authStateReady()
          const usuario = auth.currentUser
          if (!usuario) return

          let tienePerfil = true
          try {
            tienePerfil = await existePerfil(usuario.uid)
          } catch (error) {
            // Sin conexión: entramos igual, los datos cargan cuando vuelva internet
            console.error('No se pudo verificar el perfil:', error)
          }

          if (activo && tienePerfil) {
            setUserDocId(usuario.uid)
            setPantallaActual('home')
          }
        } catch (error) {
          console.error('Error al restaurar la sesión:', error)
        } finally {
          if (activo) setCargandoSesion(false)
        }
      }

      restaurarSesion()
      return () => {
        activo = false
      }
    }, [])



  const abrirEnDesarrollo = (seccion: string) => {
    setSeccionEnDesarrollo(seccion)
    setPantallaActual('en-desarrollo')
  }

  const actualizarFlowData = (parcial: FlowData) =>
    setFlowData((anterior) => ({ ...anterior, ...parcial }))

  const cerrarSesion = () => {
    const uid = userDocId
    // Primero se desasocia el teléfono (necesita la sesión activa) y después se cierra la sesión
    ;(uid ? quitarDispositivoDePush(uid) : Promise.resolve())
      .then(() => cerrarSesionFirebase())
      .catch((error) => console.error('Error al cerrar sesión:', error))
    setUserDocId(null)
    setFlowData({})
    setPantallaActual('welcome')
    limpiarCache()
  }

  const seleccionarProducto = (producto: Producto | null) => {
    setProductoSeleccionado(producto)
  }
  const mostrarExito = (mensaje: string, duracionMs = 2800) => {
    setMensajeExito(mensaje)
    setTimeout(() => {
      setMensajeExito('')
    }, duracionMs)
  }

  const ocultarExito = () => setMensajeExito('')

  return (
    <AppContext.Provider
      value={{
        pantallaActual,
        seccionEnDesarrollo,
        userData,
        flowData,
        navigate: setPantallaActual,
        abrirEnDesarrollo,
        actualizarFlowData,
        setUserDocId,
        cerrarSesion,
        productoSeleccionado,
        seleccionarProducto,
        mensajeExito,
        mostrarExito,
        ocultarExito,
        notificaciones,
        cargandoNotificaciones,
        errorNotificaciones,
      }}
    >
      {cargandoSesion ? <PantallaCarga/> : children}
    </AppContext.Provider>
  )
}

