import React, { useEffect, useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Check } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { MensajeError } from 'src/components/MensajeError'
import { useApp } from 'src/context/AppContext'
import { useUltimoCanje } from 'src/hooks/useUltimoCanje'
import { COLORES } from 'src/theme'
import type { Canje } from 'src/types'
import { formatearFecha } from 'src/utils/fechas'

const formatearPuntos = (puntos: number) => puntos.toLocaleString('es-AR')

function IconoExito() {
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
      <View style={estilos.iconoExito}>
        <Check size={44} strokeWidth={3} color={COLORES.blanco} />
      </View>
    </Animated.View>
  )
}

function EncabezadoExito() {
  return (
    <View style={estilos.encabezadoExito}>
      <IconoExito />
      <Text style={estilos.tituloExito}>¡Canje exitoso!</Text>
      <Text style={estilos.subtituloExito}>
        Mostrá este recibo para retirar tu producto en el kiosco.
      </Text>
    </View>
  )
}

function FilaRecibo({
  label,
  value,
  esCodigo = false,
}: {
  label: string
  value: string
  esCodigo?: boolean
}) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaEtiqueta}>{label}</Text>
      <Text style={[estilos.filaValor, esCodigo && estilos.filaCodigo]}>{value}</Text>
    </View>
  )
}

function ComprobanteDeCanje({ canje, puntosActuales }: { canje: Canje; puntosActuales: number }) {
  return (
    <View style={estilos.comprobante}>
      <View style={estilos.comprobanteFilas}>
        <FilaRecibo label="Producto" value={canje.producto} />
        <FilaRecibo
          label="Puntos canjeados"
          value={`-${formatearPuntos(Math.abs(canje.puntosCanjeados))}`}
        />
        <FilaRecibo label="Puntos actuales" value={formatearPuntos(puntosActuales)} />
        <FilaRecibo label="Código" value={canje.codigo} esCodigo />
        <FilaRecibo label="Fecha" value={formatearFecha(canje.fecha)} />
      </View>

      <View style={estilos.insignia}>
        <Check size={16} color={COLORES.verde} />
        <Text style={estilos.insigniaTexto}>Producto entregado</Text>
      </View>
    </View>
  )
}

interface ContenidoProps {
  canje: Canje | null
  puntosActuales: number
  cargando: boolean
  error: string
}

function Contenido({ canje, puntosActuales, cargando, error }: ContenidoProps) {
  if (cargando) {
    return <ActivityIndicator size="large" color={COLORES.verde} style={estilos.cargando} />
  }
  if (error) return <MensajeError message={error} />
  if (!canje) {
    return (
      <View style={estilos.sinCanjes}>
        <Text style={estilos.sinCanjesTitulo}>Todavía no tenés canjes</Text>
        <Text style={estilos.sinCanjesTexto}>
          Cuando canjees un producto, tu recibo va a aparecer acá.
        </Text>
      </View>
    )
  }

  return (
    <View>
      <EncabezadoExito />
      <ComprobanteDeCanje canje={canje} puntosActuales={puntosActuales} />
    </View>
  )
}

export function ReciboDeCanje() {
  const { userData, navigate } = useApp()
  const { canje, cargando, error } = useUltimoCanje(userData?.Nombre)
  const puntosActuales = Number(userData?.Puntos) || 0

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Contenido
          canje={canje}
          puntosActuales={puntosActuales}
          cargando={cargando}
          error={error}
        />
        <BotonPrimario label="Volver al inicio" onPress={() => navigate('home')} />
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 56,
  },
  cargando: {
    marginTop: 48,
  },

  // --- Encabezado de éxito
  encabezadoExito: {
    alignItems: 'center',
  },
  iconoExito: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: COLORES.verde600,
  },
  tituloExito: {
    marginTop: 20,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORES.gris900,
  },
  subtituloExito: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },

  // --- Comprobante
  comprobante: {
    marginTop: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORES.verde300,
    backgroundColor: COLORES.blanco,
    padding: 24,
  },
  comprobanteFilas: {
    gap: 16,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  filaEtiqueta: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },
  filaValor: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.gris900,
  },
  filaCodigo: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    letterSpacing: 1.5,
  },
  insignia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(22,163,74,0.1)',
    paddingVertical: 10,
  },
  insigniaTexto: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.verde600,
  },

  // --- Sin canjes
  sinCanjes: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 48,
  },
  sinCanjesTitulo: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORES.gris900,
  },
  sinCanjesTexto: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },
})
