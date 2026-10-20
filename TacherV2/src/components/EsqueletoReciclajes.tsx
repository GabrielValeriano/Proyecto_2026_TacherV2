import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Esqueleto } from 'src/components/Esqueleto'
import { COLORES } from 'src/theme'

/** Silueta de la lista de la pantalla Historial de reciclajes. */
export function EsqueletoReciclajes({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <View style={estilos.lista}>
      {Array.from({ length: cantidad }, (_, indice) => (
        <View key={indice} style={[estilos.fila, indice < cantidad - 1 && estilos.filaConDivisor]}>
          <Esqueleto style={estilos.icono} />
          <View style={estilos.textos}>
            <Esqueleto style={estilos.residuo} />
            <Esqueleto style={estilos.fecha} />
          </View>
          <Esqueleto style={estilos.puntos} />
        </View>
      ))}
    </View>
  )
}

const estilos = StyleSheet.create({
  lista: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  filaConDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
  },
  icono: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  textos: {
    flex: 1,
    gap: 8,
  },
  residuo: {
    width: '60%',
    height: 16,
  },
  fecha: {
    width: '40%',
    height: 14,
  },
  puntos: {
    width: 68,
    height: 44,
    borderRadius: 14,
  },
})
