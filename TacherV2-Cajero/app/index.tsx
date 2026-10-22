import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { PantallaEscaner } from 'src/Pantallas/PantallaEscaner'
import { PantallaInicio } from 'src/Pantallas/PantallaInicio'
import { PantallaEnDesarrollo } from 'src/Pantallas/PantallaEnDesarrollo'
import { COLORES } from 'src/theme'

type Vista = 'inicio' | 'instrucciones' | 'escaner'

function Contenido() {
  const [vista, setVista] = useState<Vista>('inicio')

  if (vista === 'instrucciones') {
    return <PantallaEnDesarrollo titulo="Instrucciones" onVolver={() => setVista('inicio')} />
  }

  if (vista === 'escaner') {
    return (
      <PantallaEscaner
        onCancelar={() => setVista('inicio')}
        onResultado={() => {}} // No hace nada al escanear
      />
    )
  }

  return (
    <PantallaInicio
      onInstrucciones={() => setVista('instrucciones')}
      onEscanear={() => setVista('escaner')}
    />
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={estilos.raiz}>
        <Contenido />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
})
