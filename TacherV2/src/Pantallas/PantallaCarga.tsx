import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { TeacherV2Logo } from 'src/components/TeacherV2Logo'
import { COLORES } from 'src/theme'

/** Se ve un instante al abrir la app, mientras se recupera la sesión guardada. */
export function PantallaCarga() {
  return (
    <View style={estilos.pantalla}>
      <TeacherV2Logo size={72} withWordmark />
      <ActivityIndicator size="large" color={COLORES.principal} style={estilos.rueda} />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
  },
  rueda: {
    marginTop: 32,
  },
})
