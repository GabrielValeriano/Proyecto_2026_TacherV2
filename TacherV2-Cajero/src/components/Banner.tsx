import React from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORES } from 'src/theme'

/** Banner superior de la app del cajero: solo el nombre, sin botones a los costados. */
export function Banner() {
  const { top } = useSafeAreaInsets()

  return (
    <View style={estilos.barra}>
      <StatusBar barStyle="light-content" />
      {/* Pinta de oscuro la zona de la barra de estado, que queda por encima del banner */}
      <View style={[estilos.zonaSuperior, { top: -top, height: top }]} />

      <Text style={estilos.nombre}>
        Tacher<Text style={estilos.nombreV2}>V2</Text>
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.oscuro,
    paddingHorizontal: 16,
  },
  zonaSuperior: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORES.oscuro,
  },
  nombre: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: COLORES.blanco,
  },
  nombreV2: {
    color: COLORES.acento,
  },
})
