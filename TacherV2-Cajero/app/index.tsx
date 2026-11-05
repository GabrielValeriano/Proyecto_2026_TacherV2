import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { PantallaEscaner } from 'src/Pantallas/PantallaEscaner'
import { PantallaInicio } from 'src/Pantallas/PantallaInicio'
import { PantallaInstrucciones } from 'src/Pantallas/PantallaInstrucciones'
import { PantallaResultado } from 'src/Pantallas/PantallaResultado'
import type { ResultadoCanje } from 'src/services/canjes'
import { COLORES } from 'src/theme'

type Vista = 'inicio' | 'instrucciones' | 'escaner' | 'resultado'

function Contenido() {
  const [vista, setVista] = useState<Vista>('inicio')
  const [resultado, setResultado] = useState<ResultadoCanje | null>(null)


  if (vista === 'instrucciones') {
    return <PantallaInstrucciones onVolver={() => setVista('inicio')} />
  }

  if (vista === 'escaner') {
    return (
      <PantallaEscaner
        onCancelar={() => setVista('inicio')}
        onResultado={(r) => {
          setResultado(r)
          setVista('resultado')
        }}
      />
    )
  }

  if (vista === 'resultado' && resultado) {
    return (
      <PantallaResultado
        resultado={resultado}
        onVolver={() => setVista('inicio')}
        onEscanearDeNuevo={() => setVista('escaner')}
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
  cargando: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  cargandoCentro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
