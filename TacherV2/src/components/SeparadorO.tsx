import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORES } from 'src/theme'

export function SeparadorO({ texto }: { texto: string }) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.linea} />
      <Text style={estilos.texto}>{texto}</Text>
      <View style={estilos.linea} />
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: COLORES.gris200,
  },
  texto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.gris400,
  },
})
