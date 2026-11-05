import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CheckCircle2 } from 'lucide-react-native'
import { useApp } from 'src/context/AppContext'
import { COLORES, SOMBRAS } from 'src/theme'

export function MensajeExito() {
  const { mensajeExito } = useApp()

  if (!mensajeExito) {
    return null
  }

  return (
    <View pointerEvents="none" style={estilos.contenedor}>
      <View style={estilos.toast}>
        <View style={estilos.iconoContenedor}>
          <CheckCircle2 size={20} color={COLORES.blanco} />
        </View>
        <Text style={estilos.texto} numberOfLines={2}>
          {mensajeExito}
        </Text>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 98,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: '100%',
    borderRadius: 9999,
    backgroundColor: COLORES.verde700,
    paddingVertical: 12,
    paddingHorizontal: 18,
    ...SOMBRAS.grande,
  },
  iconoContenedor: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  texto: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.blanco,
  },
})
