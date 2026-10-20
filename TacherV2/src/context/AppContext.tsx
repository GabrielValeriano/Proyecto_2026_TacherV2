import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { cerrarSesionFirebase } from 'src/services/autenticacion'
import { escucharUsuario } from 'src/services/usuarios'
import type { AppContextValue, FlowData, Pantalla, Usuario, Producto } from 'src/types'
import { auth } from 'src/firebase'
import { PantallaCarga } from 'src/Pantallas/PantallaCarga'
import { existePerfil } from 'src/services/usuarios'
import { precargarDatos } from 'src/services/precarga'
import { limpiarCache } from 'src/utils/cache'

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
    cerrarSesionFirebase().catch((error) => console.error('Error al cerrar sesión:', error))
    setUserDocId(null)
    setFlowData({})
    setPantallaActual('welcome')
    limpiarCache()
  }

  const seleccionarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setPantallaActual('seleccionar-producto')
  }

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
      }}
    >
      {cargandoSesion ? <PantallaCarga/> : children}
    </AppContext.Provider>
  )
}
