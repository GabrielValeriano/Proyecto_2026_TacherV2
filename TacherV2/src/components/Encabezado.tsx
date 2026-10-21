import React from 'react'
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Recycle, User } from 'lucide-react-native'
import { useApp } from 'src/context/AppContext'
import { COLORES } from 'src/theme'

/** Banner de las pantallas principales: perfil a la izquierda, nombre al centro e información a la derecha. */
export function Encabezado() {
  const { abrirEnDesarrollo, navigate } = useApp()
  const { top } = useSafeAreaInsets()

  return (
    <View style={estilos.barra}>
      <StatusBar barStyle="light-content" />
      {/* Pinta de oscuro la zona de la barra de estado, que queda por encima del banner */}
      <View style={[estilos.zonaSuperior, { top: -top, height: top }]} />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigate('perfil')}
        accessibilityLabel="Perfil"
        style={[estilos.botonCircular, estilos.botonLogo]}
      >
        <User size={24} color={COLORES.blanco} />
      </TouchableOpacity>

      <Text style={estilos.nombre}>
        Tacher<Text style={estilos.nombreV2}>V2</Text>
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => abrirEnDesarrollo('Información')}
        accessibilityLabel="Información de la app"
        style={[estilos.botonCircular, estilos.botonLogo]}
      >
        <Recycle size={24} color={COLORES.blanco} />
      </TouchableOpacity>
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORES.oscuro,
    paddingHorizontal: 16,
  },
  zonaSuperior: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORES.oscuro,
  },
  botonCircular: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  botonLogo: {
    backgroundColor: COLORES.principal,
  },
  nombre: {
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: COLORES.blanco,
  },
  nombreV2: {
    color: COLORES.acento,
  },
})
