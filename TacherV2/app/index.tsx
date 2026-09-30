import React, { type ComponentType } from 'react'
import { StatusBar } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AppProvider, useApp } from 'src/context/AppContext'
import { PantallaEnDesarrollo } from '@/src/Pantallas/PantallaEnDesarrollo'
import { PantallaEscanearDNI } from '@/src/Pantallas/PantallaEscanearDNI'
import { PantallaHome } from '@/src/Pantallas/PantallaHome'
import { PantallaLoginEmail } from '@/src/Pantallas/PantallaLoginEmail'
import { PantallaRegisterEmail } from '@/src/Pantallas/PantallaRegisterEmail'
import { PantallaRegisterUsername } from '@/src/Pantallas/PantallaRegisterUsername'
import { PantallaVerificacionCodigo } from '@/src/Pantallas/PantallaVerificacionCodigo'
import { PantallaWelcome } from '@/src/Pantallas/PantallaWelcome'
import { ReciboDeCanje } from '@/src/Pantallas/ReciboDeCanje'
import { configurarGoogleSignIn } from 'src/services/googleAuth'
import type { Pantalla } from 'src/types'

configurarGoogleSignIn()

const PANTALLAS: Record<Pantalla, ComponentType> = {
  welcome: PantallaWelcome,
  'register-email': PantallaRegisterEmail,
  'register-username': PantallaRegisterUsername,
  'login-email': PantallaLoginEmail,
  'login-code': PantallaVerificacionCodigo,
  'confirm-scan': PantallaEscanearDNI,
  home: PantallaHome,
  'recibo-canje': ReciboDeCanje,
  'en-desarrollo': PantallaEnDesarrollo,
}

function PantallaActiva() {
  const { pantallaActual } = useApp()
  const Componente = PANTALLAS[pantallaActual]
  return <Componente />
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />
          <PantallaActiva />
        </SafeAreaView>
      </SafeAreaProvider>
    </AppProvider>
  )
}
