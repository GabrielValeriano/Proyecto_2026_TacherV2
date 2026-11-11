// Copia de TacherV2/src/components/MensajeError.tsx: si cambiás uno, cambiá el otro para que las dos apps se vean iguales.
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AlertCircle } from 'lucide-react-native'
import { COLORES } from 'src/theme'

export function MensajeError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <View style={estilos.caja}>
      <View style={estilos.iconoContenedor}>
        <AlertCircle size={18} color={COLORES.rojo600} />
      </View>
      <Text style={estilos.texto}>{message}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.rojo300,
    backgroundColor: COLORES.rojo50,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  iconoContenedor: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  texto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORES.rojo600,
  },
})
