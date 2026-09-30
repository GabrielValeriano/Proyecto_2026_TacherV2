import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { GoogleLogo } from 'src/components/GoogleLogo'
import { COLORES, SOMBRAS } from 'src/theme'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
}

export function BotonGoogle({ label, onPress, loading = false }: Props) {
  if (loading) {
    return <ActivityIndicator color={COLORES.verde} style={estilos.cargando} />
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={estilos.boton}>
      <GoogleLogo size={20} />
      <Text style={estilos.texto}>{label}</Text>
    </TouchableOpacity>
  )
}

const estilos = StyleSheet.create({
  cargando: {
    marginVertical: 12,
  },
  boton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.gris200,
    backgroundColor: COLORES.blanco,
    ...SOMBRAS.chica,
  },
  texto: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.gris700,
  },
})
