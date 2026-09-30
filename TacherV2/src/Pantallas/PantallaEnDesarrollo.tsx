import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { COLORES } from 'src/theme'
import { useApp } from 'src/context/AppContext'

export function PantallaEnDesarrollo() {
  const { navigate, seccionEnDesarrollo } = useApp()

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.etiqueta}>En Desarrollo</Text>
      <Text style={estilos.seccion}>{seccionEnDesarrollo}</Text>
      <Text style={estilos.descripcion}>Esta sección no está implementada todavía.</Text>
      <BotonPrimario
        label="Volver a Inicio"
        onPress={() => navigate('home')}
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
    backgroundColor: COLORES.verde100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.verde700,
  },
  seccion: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORES.gris900,
  },
  descripcion: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },
  botonVolver: {
    width: 'auto',
    paddingHorizontal: 24,
  },
})
