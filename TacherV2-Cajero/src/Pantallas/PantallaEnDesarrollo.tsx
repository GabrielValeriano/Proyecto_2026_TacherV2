import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { COLORES } from 'src/theme'

interface Props {
  onVolver: () => void
  titulo?: string
}

export function PantallaEnDesarrollo({ onVolver, titulo = 'Instrucciones' }: Props) {
  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.etiqueta}>En Desarrollo</Text>
      <Text style={estilos.seccion}>{titulo}</Text>
      <Text style={estilos.descripcion}>Esta sección no está implementada todavía.</Text>
      <BotonPrimario
        label="Volver al inicio"
        onPress={onVolver}
        style={estilos.botonVolver}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
    padding: 24,
  },
  etiqueta: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.principal,
  },
  seccion: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORES.texto,
  },
  descripcion: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  botonVolver: {
    width: 'auto',
    paddingHorizontal: 24,
  },
})
