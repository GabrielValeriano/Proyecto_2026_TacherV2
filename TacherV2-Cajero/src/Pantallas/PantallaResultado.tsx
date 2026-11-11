import React, { useEffect, useRef } from 'react'
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Check, X } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CirculoMarca } from 'src/components/CirculoMarca'
import type { ResultadoCanje } from 'src/services/canjes'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props {
  resultado: ResultadoCanje
  onVolver: () => void
  onEscanearDeNuevo: () => void
}

function IconoResultado({ exito }: { exito: boolean }) {
  const escala = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.spring(escala, { toValue: 1, friction: 4, useNativeDriver: true }).start()
  }, [escala])

  const opacidad = escala.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View style={{ transform: [{ scale: escala }], opacity: opacidad }}>
      {exito ? (
        // Éxito: el mismo círculo con degradé del logo
        <CirculoMarca size={112} borde={{ color: COLORES.acento, ancho: 4 }}>
          <Check size={56} strokeWidth={3} color={COLORES.blanco} />
        </CirculoMarca>
      ) : (
        <View style={[estilos.circulo, estilos.circuloError]}>
          <X size={56} strokeWidth={3} color={COLORES.blanco} />
        </View>
      )}
    </Animated.View>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.filaValor}>{valor}</Text>
    </View>
  )
}

export function PantallaResultado({ resultado, onVolver, onEscanearDeNuevo }: Props) {
  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <IconoResultado exito={resultado.ok} />

          <Text style={estilos.titulo}>
            {resultado.ok ? '¡El canje fue exitoso!' : 'No se pudo realizar el canje'}
          </Text>

          <Text style={estilos.subtitulo}>
            {resultado.ok ? 'Entregá el producto al cliente.' : resultado.mensaje}
          </Text>
        </View>

        {resultado.ok && (
          <View style={estilos.comprobante}>
            <Text style={estilos.comprobanteTitulo}>Comprobante</Text>
            <Fila etiqueta="Producto" valor={resultado.producto} />
            <Fila etiqueta="Cliente" valor={`@${resultado.cliente}`} />
            <Fila
              etiqueta="Puntos descontados"
              valor={`-${resultado.puntos.toLocaleString('es-AR')}`}
            />
          </View>
        )}
      </ScrollView>

      <View style={estilos.pie}>
        {!resultado.ok && <BotonPrimario label="Escanear de nuevo" onPress={onEscanearDeNuevo} />}
        <BotonPrimario
          label="Volver"
          variante={resultado.ok ? 'solido' : 'contorno'}
          onPress={onVolver}
        />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  encabezado: {
    alignItems: 'center',
    gap: 12,
  },
  circulo: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 56,
  },
  circuloError: {
    borderWidth: 4,
    borderColor: COLORES.rojo300,
    backgroundColor: COLORES.rojo600,
    shadowColor: COLORES.rojo600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  titulo: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: COLORES.texto,
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: COLORES.textoSuave,
  },
  comprobante: {
    gap: 16,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.blanco,
    padding: 22,
    ...SOMBRAS.media,
  },
  comprobanteTitulo: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORES.principal,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  filaEtiqueta: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  filaValor: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  pie: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 14,
  },
})
