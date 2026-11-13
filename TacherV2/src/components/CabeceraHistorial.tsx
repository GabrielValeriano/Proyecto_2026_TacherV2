import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

export interface MetricaHistorial {
  etiqueta: string
  valor: string
}

interface Props {
  icono: LucideIcon
  /** Texto chico de arriba, por ejemplo "Historial". */
  etiqueta: string
  titulo: string
  descripcion: string
  metricas: MetricaHistorial[]
  /** Título de la lista que viene debajo, por ejemplo "Tus reciclajes". */
  tituloLista: string
}

/**
 * Cabecera de los historiales: el título y el resumen van juntos en una tarjeta destacada,
 * y debajo el título de la lista. La comparten Historial de reciclajes y de canjes.
 */
export function CabeceraHistorial({ icono: Icono, etiqueta, titulo, descripcion, metricas, tituloLista }: Props) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.tarjeta}>
        <View style={estilos.circuloDecorativoGrande} />
        <View style={estilos.circuloDecorativoChico} />

        <View style={estilos.cabecera}>
          <View style={estilos.icono}>
            <Icono size={24} color={COLORES.verde700} />
          </View>
          <View style={estilos.textos}>
            <View style={estilos.etiquetaPastilla}>
              <Text style={estilos.etiqueta}>{etiqueta}</Text>
            </View>
            <Text style={estilos.titulo} accessibilityRole="header">
              {titulo}
            </Text>
          </View>
        </View>
        <Text style={estilos.descripcion}>{descripcion}</Text>

        <View style={estilos.metricas}>
          {metricas.map(({ etiqueta: nombre, valor }) => (
            <View key={nombre} style={estilos.metrica} accessible accessibilityLabel={`${nombre}: ${valor}`}>
              <Text style={estilos.metricaValor} numberOfLines={1} adjustsFontSizeToFit>
                {valor}
              </Text>
              <Text style={estilos.metricaEtiqueta}>{nombre}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={estilos.tituloLista} accessibilityRole="header">
        {tituloLista}
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 22,
    paddingTop: 20,
    paddingBottom: 12,
  },
  tarjeta: {
    gap: 14,
    overflow: 'hidden',
    borderRadius: RADIOS.grande,
    backgroundColor: COLORES.oscuro,
    padding: 20,
    ...SOMBRAS.marca,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circuloDecorativoChico: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icono: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.medio,
    backgroundColor: COLORES.verde300,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  etiquetaPastilla: {
    alignSelf: 'flex-start',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.verde300,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  etiqueta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    // Verde oscuro (no verde700) para que el texto chico se lea bien sobre el verde300
    color: COLORES.oscuro,
  },
  titulo: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: COLORES.blanco,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.sobreOscuro,
  },
  metricas: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  metrica: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricaValor: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORES.blanco,
  },
  metricaEtiqueta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.sobreOscuro,
  },
  tituloLista: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORES.texto,
  },
})
