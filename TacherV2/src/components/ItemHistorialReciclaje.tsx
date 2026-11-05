import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { obtenerIconoCategoria } from 'src/utils/reciclajesIconos'
import { COLORES, SOMBRAS } from 'src/theme'
import { formatearFecha } from 'src/utils/fechas'
import type { Reciclaje } from 'src/services/reciclajes'

interface Props {
  reciclaje: Reciclaje
  conDivisor: boolean
}

export function ItemHistorialReciclaje({ reciclaje, conDivisor }: Props) {
  const { Icono, color } = obtenerIconoCategoria(reciclaje.categoria, reciclaje.residuoId || reciclaje.residuo)
  const fechaTexto = formatearFecha(reciclaje.fecha)

  return (
    <View style={[estilos.fila, conDivisor && estilos.filaConDivisor]}>
      <View style={estilos.iconoContenedor}>
        <Icono size={24} color={color} />
      </View>

      <View style={estilos.textos}>
        <Text style={estilos.titulo} numberOfLines={1}>
          {reciclaje.residuo}
        </Text>
        <Text style={estilos.fecha} numberOfLines={1}>
          {fechaTexto}
        </Text>
      </View>

      <View style={estilos.puntosContenedor}>
        <Text style={estilos.puntosTexto}>+{reciclaje.puntos.toLocaleString('es-AR')} pts</Text>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filaConDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
  },
  iconoContenedor: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORES.suave,
    ...SOMBRAS.chica,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  fecha: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  puntosContenedor: {
    alignItems: 'flex-end',
  },
  puntosTexto: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.principal,
  },
})
