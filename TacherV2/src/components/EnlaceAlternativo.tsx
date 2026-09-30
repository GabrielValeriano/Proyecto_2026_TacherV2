import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORES } from 'src/theme'

interface Props {
  pregunta: string
  accion: string
  onPress: () => void
}

/** Pie de pantalla tipo "¿Ya tenés cuenta? Iniciá sesión". */
export function EnlaceAlternativo({ pregunta, accion, onPress }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.pregunta}>{pregunta}</Text>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <Text style={estilos.accion}>{accion}</Text>
      </TouchableOpacity>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 24,
  },
  pregunta: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },
  accion: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORES.verde600,
  },
})
