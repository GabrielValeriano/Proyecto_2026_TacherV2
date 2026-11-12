import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { obtenerIconoCategoria } from 'src/utils/reciclajesIconos'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'
import { formatearFecha } from 'src/utils/fechas'
import type { Reciclaje } from 'src/services/reciclajes'

/** Un reciclaje en su propia tarjeta: ícono del material, nombre, material y fecha, y los puntos. */
export function ItemHistorialReciclaje({ reciclaje }: { reciclaje: Reciclaje }) {
  const { Icono, color, fondo, etiqueta } = obtenerIconoCategoria(reciclaje.categoria, reciclaje.residuo)
  const fechaTexto = formatearFecha(reciclaje.fecha)
  const puntos = reciclaje.puntos.toLocaleString('es-AR')

  return (
    <View
      style={estilos.tarjeta}
      accessible
      accessibilityLabel={`${reciclaje.residuo}${etiqueta ? `, ${etiqueta}` : ''}, ${fechaTexto}, más ${puntos} puntos`}
    >
      <View style={[estilos.icono, { backgroundColor: fondo }]}>
        <Icono size={24} color={color} />
      </View>

      <View style={estilos.textos}>
        <Text style={estilos.titulo} numberOfLines={1}>
          {reciclaje.residuo}
        </Text>
        <View style={estilos.detalle}>
          {etiqueta && (
            <View style={[estilos.chip, { backgroundColor: fondo }]}>
              <Text style={[estilos.chipTexto, { color }]}>{etiqueta}</Text>
            </View>
          )}
          <Text style={estilos.fecha} numberOfLines={1}>
            {fechaTexto}
          </Text>
        </View>
      </View>

      <View style={estilos.puntos}>
        <Text style={estilos.puntosNumero}>+{puntos}</Text>
        <Text style={estilos.puntosUnidad}>pts</Text>
      </View>
    </View>
  )
}

const TAMANIO_ICONO = 50

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...SOMBRAS.chica,
  },
  icono: {
    width: TAMANIO_ICONO,
    height: TAMANIO_ICONO,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TAMANIO_ICONO / 2,
  },
  textos: {
    flex: 1,
    gap: 5,
  },
  titulo: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORES.texto,
  },
  detalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipTexto: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  fecha: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  puntos: {
    minWidth: 60,
    alignItems: 'center',
    borderRadius: RADIOS.chico,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  puntosNumero: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: COLORES.principalOscuro,
  },
  puntosUnidad: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: COLORES.textoSuave,
  },
})
