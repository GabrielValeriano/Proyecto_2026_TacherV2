import React from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { Esqueleto } from 'src/components/Esqueleto'

/** Mismo orden y alturas que el podio real: segundo, primero y tercero. */
const ORDEN_PODIO = [1, 0, 2]
const ALTURAS_PODIO = [124, 92, 68]
const TAMAÑOS_AVATAR = [76, 60, 60]

/** Sobre el fondo oscuro del ranking, el gris se reemplaza por un blanco translúcido. */
function BloqueOscuro({ style }: { style?: StyleProp<ViewStyle> }) {
  return <Esqueleto style={[estilos.sobreOscuro, style]} />
}

/** Silueta del podio de la pantalla Ranking. */
export function EsqueletoPodio() {
  return (
    <View style={estilos.podio}>
      {ORDEN_PODIO.map((indice) => (
        <View key={indice} style={estilos.columna}>
          <View style={estilos.datos}>
            <BloqueOscuro
              style={{
                width: TAMAÑOS_AVATAR[indice],
                height: TAMAÑOS_AVATAR[indice],
                borderRadius: TAMAÑOS_AVATAR[indice] / 2,
              }}
            />
            <BloqueOscuro style={estilos.nombre} />
            <BloqueOscuro style={estilos.cantidad} />
          </View>
          <BloqueOscuro style={[estilos.bloque, { height: ALTURAS_PODIO[indice] }]} />
        </View>
      ))}
    </View>
  )
}

const estilos = StyleSheet.create({
  sobreOscuro: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  podio: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
  },
  columna: {
    flex: 1,
    alignItems: 'center',
  },
  datos: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  nombre: {
    width: '70%',
    height: 14,
    borderRadius: 7,
  },
  cantidad: {
    width: 56,
    height: 24,
    borderRadius: 12,
  },
  bloque: {
    width: '100%',
    borderRadius: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
})
