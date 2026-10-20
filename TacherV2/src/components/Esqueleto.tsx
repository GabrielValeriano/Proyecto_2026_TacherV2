import React from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { COLORES } from 'src/theme'

/** Bloque gris que reemplaza a un texto o una imagen mientras cargan los datos. */
export function Esqueleto({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.bloque, style]} />
}

const estilos = StyleSheet.create({
  bloque: {
    borderRadius: 8,
    backgroundColor: COLORES.gris200,
  },
})
