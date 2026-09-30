import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORES } from 'src/theme'

export function MensajeError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <View style={estilos.caja}>
      <Text style={estilos.texto}>{message}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  caja: {
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.rojo300,
    backgroundColor: COLORES.rojo50,
    padding: 12,
  },
  texto: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.rojo600,
  },
})
