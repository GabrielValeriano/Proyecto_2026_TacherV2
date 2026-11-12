import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Coins, History } from 'lucide-react-native'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props {
  puntos: number
  /** Si se pasa, muestra el botón "Mis canjes" (en la pantalla principal de Canjes). */
  onCanjesHistorial?: () => void
}

/** Tarjeta oscura de arriba de Canjes con los puntos disponibles. */
export function TarjetaPuntosCanjes({ puntos, onCanjesHistorial }: Props) {
  return (
    <View style={estilos.tarjetaSuperior}>
      <View pointerEvents="none" style={estilos.circuloDecorativoGrande} />
      <View pointerEvents="none" style={estilos.circuloDecorativoChico} />

      <View style={estilos.filaSuperior}>
        <View style={estilos.puntosIzquierda}>
          <View style={estilos.iconoMoneda}>
            <Coins size={22} color={COLORES.blanco} />
          </View>
          <View>
            <Text style={estilos.etiquetaPuntos}>Puntos Disponibles</Text>
            <View style={estilos.filaSaldo}>
              <Text style={estilos.saldoPuntos}>{puntos.toLocaleString('es-AR')}</Text>
            </View>
          </View>
        </View>

        {onCanjesHistorial && (
          <TouchableOpacity activeOpacity={0.8} onPress={onCanjesHistorial} style={estilos.botonHistorial}>
            <History size={18} color={COLORES.blanco} />
            <Text style={estilos.textoBotonHistorial}>Mis canjes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  tarjetaSuperior: {
    overflow: 'hidden',
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.oscuro,
    padding: 22,
    ...SOMBRAS.media,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    right: 100,
    top: 0,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: COLORES.principal,
    opacity: 0.45,
  },
  circuloDecorativoChico: {
    position: 'absolute',
    right: 30,
    bottom: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORES.principal,
    opacity: 0.25,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  puntosIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconoMoneda: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  etiquetaPuntos: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.sobreOscuro,
  },
  filaSaldo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  saldoPuntos: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  botonHistorial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADIOS.pildora,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textoBotonHistorial: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORES.blanco,
  },
})
