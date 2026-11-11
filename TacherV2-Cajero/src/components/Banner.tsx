import React from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MarcaTacherV2, TacherV2Logo } from 'src/components/TacherV2Logo'
import { COLORES, RADIOS } from 'src/theme'

/** Banner superior de la app del cajero: el logo oficial, el nombre y la etiqueta "Cajero". */
export function Banner() {
  const { top } = useSafeAreaInsets()

  return (
    <View style={estilos.barra}>
      <StatusBar barStyle="light-content" />
      {/* Pinta de oscuro la zona de la barra de estado, que queda por encima del banner */}
      <View style={[estilos.zonaSuperior, { top: -top, height: top }]} />

      <View style={estilos.marca}>
        <TacherV2Logo size={40} />
        <MarcaTacherV2 tamanio={24} claro />
      </View>

      <View style={estilos.etiqueta}>
        <Text style={estilos.etiquetaTexto}>Cajero</Text>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORES.oscuro,
    paddingHorizontal: 16,
  },
  zonaSuperior: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORES.oscuro,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  etiqueta: {
    borderRadius: RADIOS.pildora,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  etiquetaTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORES.acento,
  },
})
