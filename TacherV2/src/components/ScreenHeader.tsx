import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { COLORES, RADIOS } from 'src/theme'

interface Props {
  title: string
  onBack?: () => void
}

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={estilos.contenedor}>
      {onBack && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={estilos.botonVolver}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={6}
        >
          <ChevronLeft size={22} strokeWidth={2.5} color={COLORES.principalOscuro} />
        </TouchableOpacity>
      )}
      <Text style={estilos.titulo} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botonVolver: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.suave,
  },
  titulo: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORES.texto,
  },
})
