import React from 'react'
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell } from 'lucide-react-native'
import { CirculoMarca } from 'src/components/CirculoMarca'
import { MarcaTacherV2, TacherV2Logo } from 'src/components/TacherV2Logo'
import { useApp } from 'src/context/AppContext'
import { COLORES } from 'src/theme'

/** Banner de las pantallas principales: notificaciones a la izquierda, nombre al centro e información a la derecha. */
export function Encabezado() {
  const { navigate, notificaciones } = useApp()
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
        hitSlop={6}
      >
        {/* Mismo círculo, tamaño y sombra que el logo de la derecha */}
        <CirculoMarca size={44}>
          <Bell size={22} strokeWidth={2} color={COLORES.blanco} />
        </CirculoMarca>
        {noLeidas > 0 && (
          <View style={estilos.insignia}>
            <Text style={estilos.insigniaTexto}>{noLeidas > 9 ? '9+' : noLeidas}</Text>
          </View>
        )}
      </TouchableOpacity>

      <MarcaTacherV2 tamanio={25} claro />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigate('informacion')}
        accessibilityLabel="Información de la app"
        hitSlop={6}
      >
        {/* El mismo logo de la bienvenida */}
        <TacherV2Logo size={44} />
      </TouchableOpacity>
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    height: 70,
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
})
