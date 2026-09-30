import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { cerrarSesionFirebase } from 'src/services/autenticacion'
import { escucharUsuario } from 'src/services/usuarios'
import type { AppContextValue, FlowData, Pantalla, Usuario } from 'src/types'

const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider')
  return context
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [pantallaActual, setPantallaActual] = useState<Pantalla>('register-username')
  const [seccionEnDesarrollo, setSeccionEnDesarrollo] = useState('')
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
    setPantallaActual('login-email')
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
