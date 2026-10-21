import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { TeacherV2Logo } from 'src/components/TeacherV2Logo'
import { COLORES } from 'src/theme'

/**
 * Pantalla completa de carga: el logo, una rueda y, si se quiere, un mensaje.
 * Se usa al abrir la app, al iniciar sesión y al terminar el registro.
 */
export function PantallaCarga({ mensaje }: { mensaje?: string }) {
  return (
    <View style={estilos.pantalla}>
      <TeacherV2Logo size={72} withWordmark />
      <ActivityIndicator size="large" color={COLORES.principal} style={estilos.rueda} />
      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 24,
  },
  rueda: {
    marginTop: 32,
  },
  mensaje: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    color: COLORES.textoSuave,
  },
})
