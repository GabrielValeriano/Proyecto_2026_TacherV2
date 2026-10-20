import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Esqueleto } from 'src/components/Esqueleto'
import { COLORES } from 'src/theme'

/** Silueta de la cuadrícula de productos de la pantalla Canjes. */
export function EsqueletoProductos({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <View style={estilos.cuadricula}>
      {Array.from({ length: cantidad }, (_, indice) => (
        <View key={indice} style={estilos.tarjeta}>
          <Esqueleto style={estilos.imagen} />
          <View style={estilos.textos}>
            <Esqueleto style={estilos.nombreLinea1} />
            <Esqueleto style={estilos.nombreLinea2} />
            <Esqueleto style={estilos.puntos} />
          </View>
        </View>
      ))}
    </View>
  )
}

const estilos = StyleSheet.create({
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  tarjeta: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
  },
  imagen: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  textos: {
    gap: 8,
    padding: 12,
  },
  nombreLinea1: {
    width: '90%',
    height: 16,
  },
  nombreLinea2: {
    width: '60%',
    height: 16,
  },
  puntos: {
    width: '45%',
    height: 14,
    marginTop: 4,
  },
})
