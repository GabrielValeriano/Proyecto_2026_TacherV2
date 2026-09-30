import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { COLORES } from 'src/theme'

export function TituloDePantalla({ texto }: { texto: string }) {
  return <Text style={estilos.titulo}>{texto}</Text>
}

const estilos = StyleSheet.create({
  titulo: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.75,
    color: COLORES.gris900,
  },
})
