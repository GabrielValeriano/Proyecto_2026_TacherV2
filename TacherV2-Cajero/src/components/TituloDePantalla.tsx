// Copia de TacherV2/src/components/TituloDePantalla.tsx: si cambiás uno, cambiá el otro para que las dos apps se vean iguales.
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
    fontWeight: '800',
    letterSpacing: -0.9,
    color: COLORES.gris900,
  },
})
