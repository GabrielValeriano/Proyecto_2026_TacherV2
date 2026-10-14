import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { COLORES } from 'src/theme'

interface Props {
  title: string
  onBack?: () => void
}

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={estilos.contenedor}>
      {onBack && (
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={estilos.botonVolver}>
          <ChevronLeft size={24} color={COLORES.verde} />
        </TouchableOpacity>
      )}
      <Text style={estilos.titulo}>{title}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.gris200,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botonVolver: {
    padding: 4,
  },
  titulo: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.verde700,
  },
})
