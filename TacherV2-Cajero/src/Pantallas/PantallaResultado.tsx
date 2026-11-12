import React, { useEffect, useRef, useState } from 'react'
import { Animated, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { CalendarClock, Coins, Hash, ShieldCheck, User, X, type LucideIcon } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { IconoExito } from 'src/components/IconoExito'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { CapaVerde, EntradaSuave, useTransicionVerde } from 'src/components/TransicionVerde'
import type { ResultadoCanje } from 'src/services/canjes'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props {
  resultado: ResultadoCanje
  onVolver: () => void
  onEscanearDeNuevo: () => void
}

type Exito = Extract<ResultadoCanje, { ok: true }>

const formatearPuntos = (puntos: number) => puntos.toLocaleString('es-AR')

const formatearFechaHora = (fecha: Date) =>
  fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

export function PantallaResultado(props: Props) {
  return props.resultado.ok ? (
    <ResultadoExitoso {...props} exito={props.resultado} />
  ) : (
    <ResultadoFallido mensaje={props.resultado.mensaje} {...props} />
  )
}

// ---------------------------------------------------------------------------
// Canje validado: transición verde y ticket de entrega
// ---------------------------------------------------------------------------

function ResultadoExitoso({ exito, onVolver, onEscanearDeNuevo }: Props & { exito: Exito }) {
  const [listo, setListo] = useState(false)
  const { escala, opacidad } = useTransicionVerde(() => setListo(true))

  return (
    <View style={estilos.pantalla}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        {listo && (
          <View style={estilos.cuerpo}>
            <EntradaSuave>
              <View style={estilos.encabezado}>
                <IconoExito />
                <Text style={estilos.titulo} accessibilityRole="header">
                  Entrega validada
                </Text>
                <Text style={estilos.descripcion}>
                  El canje es correcto y ya se descontaron los puntos. Entregale el producto al cliente.
                </Text>
              </View>
            </EntradaSuave>

            <EntradaSuave demora={120}>
              <View style={estilos.tarjeta}>
                <Text style={estilos.etiquetaBloque}>Producto a entregar</Text>
                <View style={estilos.productoFila}>
                  <View style={estilos.productoImagen}>
                    <ImagenProducto uri={exito.imagen} tamañoIcono={26} style={estilos.productoImagenInterna} />
                  </View>
                  <View style={estilos.productoTextos}>
                    <Text style={estilos.productoNombre} numberOfLines={2}>
                      {exito.producto}
                    </Text>
                    <View style={estilos.chipPuntos}>
                      <Text style={estilos.chipPuntosTexto}>-{formatearPuntos(exito.puntos)} pts</Text>
                    </View>
                  </View>
                </View>
              </View>
            </EntradaSuave>

            <EntradaSuave demora={220}>
              <View style={estilos.tarjeta}>
                <Text style={estilos.etiquetaBloque}>Datos de control</Text>
                <View>
                  <Fila icono={User} etiqueta="Cliente">
                    <Text style={estilos.valor} numberOfLines={1}>
                      @{exito.cliente}
                    </Text>
                  </Fila>
                  <Fila icono={Coins} etiqueta="Puntos descontados">
                    <Text style={estilos.valorDestacado}>-{formatearPuntos(exito.puntos)} pts</Text>
                  </Fila>
                  <Fila icono={CalendarClock} etiqueta="Validado">
                    <Text style={estilos.valor}>{formatearFechaHora(exito.fecha)}</Text>
                  </Fila>
                  <Fila icono={Hash} etiqueta="Código de canje" ultima>
                    <View style={estilos.codigoPastilla}>
                      <Text style={estilos.codigoTexto} selectable numberOfLines={1}>
                        {exito.codigo}
                      </Text>
                    </View>
                  </Fila>
                </View>

                {/* Pie de ticket: el QR ya no sirve */}
                <View style={estilos.sello}>
                  <ShieldCheck size={16} color={COLORES.principalOscuro} />
                  <Text style={estilos.selloTexto}>Canje finalizado: este QR ya no se puede volver a usar.</Text>
                </View>
              </View>
            </EntradaSuave>
          </View>
        )}
      </ScrollView>

      {listo && (
        <EntradaSuave demora={320}>
          <View style={estilos.pie}>
            <BotonPrimario label="Escanear otro QR" onPress={onEscanearDeNuevo} />
            <BotonPrimario label="Volver al inicio" variante="contorno" onPress={onVolver} />
          </View>
        </EntradaSuave>
      )}

      {!listo && <CapaVerde escala={escala} opacidad={opacidad} />}
    </View>
  )
}

function Fila({
  icono: Icono,
  etiqueta,
  children,
  ultima = false,
}: {
  icono: LucideIcon
  etiqueta: string
  children: React.ReactNode
  ultima?: boolean
}) {
  return (
    <View style={[estilos.fila, !ultima && estilos.filaConDivisor]}>
      <View style={estilos.filaIzquierda}>
        <View style={estilos.filaIcono}>
          <Icono size={16} color={COLORES.verde700} />
        </View>
        <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
      </View>
      {children}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Canje rechazado (sin transición verde)
// ---------------------------------------------------------------------------

function ResultadoFallido({ mensaje, onVolver, onEscanearDeNuevo }: Props & { mensaje: string }) {
  const escala = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.spring(escala, { toValue: 1, friction: 4, useNativeDriver: true }).start()
  }, [escala])

  const opacidad = escala.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1], extrapolate: 'clamp' })

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={[estilos.contenido, estilos.contenidoCentrado]}>
        <View style={estilos.encabezado}>
          <Animated.View style={{ transform: [{ scale: escala }], opacity: opacidad }}>
            <View style={estilos.circuloError}>
              <X size={46} strokeWidth={3.25} color={COLORES.blanco} />
            </View>
          </Animated.View>
          <Text style={estilos.titulo} accessibilityRole="header">
            No se pudo realizar el canje
          </Text>
          <Text style={estilos.descripcion}>{mensaje}</Text>
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        <BotonPrimario label="Escanear de nuevo" onPress={onEscanearDeNuevo} />
        <BotonPrimario label="Volver" variante="contorno" onPress={onVolver} />
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  contenidoCentrado: {
    justifyContent: 'center',
  },
  cuerpo: {
    gap: 16,
  },

  // --- Encabezado
  encabezado: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: COLORES.gris900,
  },
  descripcion: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  circuloError: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 42,
    backgroundColor: COLORES.rojo600,
    shadowColor: COLORES.rojo600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },

  // --- Tarjetas
  tarjeta: {
    gap: 14,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    ...SOMBRAS.chica,
  },
  etiquetaBloque: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORES.verde700,
  },

  // --- Producto
  productoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  productoImagen: {
    width: 64,
    height: 64,
    overflow: 'hidden',
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
  },
  productoImagenInterna: {
    width: 64,
    height: 64,
  },
  productoTextos: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  productoNombre: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: COLORES.gris900,
  },
  chipPuntos: {
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.verde100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipPuntosTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: COLORES.verde700,
  },

  // --- Filas de control
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  filaConDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
  },
  filaIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filaIcono: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.chico - 2,
    backgroundColor: COLORES.verde100,
  },
  filaEtiqueta: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris500,
  },
  valor: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORES.gris900,
  },
  valorDestacado: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORES.verde700,
  },
  codigoPastilla: {
    flexShrink: 1,
    borderRadius: RADIOS.chico,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  codigoTexto: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: COLORES.gris900,
  },
  sello: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selloTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORES.principalOscuro,
  },

  // --- Botones
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
