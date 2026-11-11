import React from 'react'
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell, Recycle } from 'lucide-react-native'
import { useApp } from 'src/context/AppContext'
import { COLORES } from 'src/theme'

/** Banner de las pantallas principales: notificaciones a la izquierda, nombre al centro e información a la derecha. */
export function Encabezado() {
  const { abrirEnDesarrollo, navigate, notificaciones } = useApp()
  const { top } = useSafeAreaInsets()
  const noLeidas = notificaciones.filter((notificacion) => !notificacion.leida).length

  return (
    <View style={estilos.barra}>
      <StatusBar barStyle="light-content" />
      {/* Pinta de oscuro la zona de la barra de estado, que queda por encima del banner */}
      <View style={[estilos.zonaSuperior, { top: -top, height: top }]} />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigate('notificaciones')}
        accessibilityLabel={
          noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'
        }
        style={[estilos.botonCircular, estilos.botonLogo]}
      >
        <Bell size={24} color={COLORES.blanco} />
        {noLeidas > 0 && (
          <View style={estilos.insignia}>
            <Text style={estilos.insigniaTexto}>{noLeidas > 9 ? '9+' : noLeidas}</Text>
          </View>
        )}
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
  insignia: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORES.oscuro,
    backgroundColor: COLORES.acento,
  },
  insigniaTexto: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: COLORES.oscuro,
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
