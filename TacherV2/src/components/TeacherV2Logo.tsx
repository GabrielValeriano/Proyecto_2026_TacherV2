import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Recycle } from 'lucide-react-native'
import { COLORES } from 'src/theme'

interface Props {
  size?: number
  withWordmark?: boolean
}

export function TeacherV2Logo({ size = 36, withWordmark = false }: Props) {
  return (
    <View style={estilos.contenedor}>
      <View style={[estilos.icono, { width: size, height: size }]}>
        <Recycle size={size * 0.6} color={COLORES.blanco} />
      </View>
      {withWordmark && (
        <Text style={estilos.nombre}>
          Teacher<Text style={estilos.nombreV2}>V2</Text>
        </Text>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icono: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORES.verde600,
  },
  nombre: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.gris900,
  },
  nombreV2: {
    color: COLORES.verde600,
  },
})
