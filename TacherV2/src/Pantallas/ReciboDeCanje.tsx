import React, { useState } from 'react'
import { ActivityIndicator, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { CalendarClock, Coins, Hash, Wallet, type LucideIcon } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { IconoExito } from 'src/components/IconoExito'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { MensajeError } from 'src/components/MensajeError'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { CapaVerde, EntradaSuave, useTransicionVerde } from 'src/components/TransicionVerde'
import { useApp } from 'src/context/AppContext'
import { useProductos } from 'src/hooks/useProductos'
import { useUltimoCanje } from 'src/hooks/useUltimoCanje'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'
import type { Canje, Producto } from 'src/types'
import { formatearFecha } from 'src/utils/fechas'

const formatearPuntos = (puntos: number) => puntos.toLocaleString('es-AR')

// ---------------------------------------------------------------------------
// Bloques del recibo
// ---------------------------------------------------------------------------

function Encabezado() {
  return (
    <View style={estilos.encabezado}>
      <IconoExito />
      <View accessibilityRole="header">
        <TituloDePantalla texto="¡Canje exitoso!" />
      </View>
      <Text style={estilos.descripcion}>
        El cajero ya validó tu canje y te entregó el producto. ¡Gracias por reciclar!
      </Text>
    </View>
  )
}

function TarjetaProducto({ canje, producto }: { canje: Canje; producto?: Producto }) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.etiquetaBloque}>Producto canjeado</Text>
      <View style={estilos.productoFila}>
        <View style={estilos.productoImagen}>
          <ImagenProducto uri={producto?.imagen ?? null} tamañoIcono={26} style={estilos.productoImagenInterna} />
        </View>
        <View style={estilos.productoTextos}>
          <Text style={estilos.productoNombre} numberOfLines={2}>
            {canje.producto}
          </Text>
          {producto?.categoria ? (
            <View style={estilos.chipCategoria}>
              <Text style={estilos.chipCategoriaTexto}>{producto.categoria}</Text>
            </View>
          ) : null}
        </View>
      </View>
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

function ResumenTransaccion({ canje, puntosActuales }: { canje: Canje; puntosActuales: number }) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.etiquetaBloque}>Detalle de la operación</Text>
      <View>
        <Fila icono={Coins} etiqueta="Puntos descontados">
          <Text style={estilos.valorDestacado}>-{formatearPuntos(Math.abs(canje.puntosCanjeados))} pts</Text>
        </Fila>
        <Fila icono={Wallet} etiqueta="Saldo actual">
          <Text style={estilos.valor}>{formatearPuntos(puntosActuales)} pts</Text>
        </Fila>
        <Fila icono={CalendarClock} etiqueta="Fecha y hora">
          <Text style={estilos.valor}>{formatearFecha(canje.fecha)}</Text>
        </Fila>
        <Fila icono={Hash} etiqueta="Código de operación" ultima>
          <View style={estilos.codigoPastilla}>
            <Text style={estilos.codigoTexto} selectable numberOfLines={1}>
              {canje.codigo}
            </Text>
          </View>
        </Fila>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export function ReciboDeCanje() {
  const { userData, navigate, seleccionarProducto } = useApp()
  const { canje, cargando, error } = useUltimoCanje(userData?.Nombre)
  const { productos } = useProductos()
  const [transicionTerminada, setTransicionTerminada] = useState(false)
  const { escala, opacidad } = useTransicionVerde(() => setTransicionTerminada(true))
  const puntosActuales = Number(userData?.Puntos) || 0

  const producto = canje
    ? productos.find((p) => p.id === canje.productoId) ?? productos.find((p) => p.nombre === canje.producto)
    : undefined

  // El canje terminó: se olvida el producto para que Canjes arranque sin nada elegido
  const volverAlInicio = () => {
    seleccionarProducto(null)
    navigate('home')
  }

  const listo = transicionTerminada && !cargando

  return (
    <View style={estilos.pantalla}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        {transicionTerminada && cargando && (
          <ActivityIndicator size="large" color={COLORES.verde} style={estilos.cargando} />
        )}

        {listo && error !== '' && <MensajeError message={error} />}

        {listo && !error && !canje && (
          <EntradaSuave>
            <View style={estilos.sinCanjes}>
              <TituloDePantalla texto="Todavía no tenés canjes" />
              <Text style={estilos.descripcion}>Cuando canjees un producto, tu recibo va a aparecer acá.</Text>
            </View>
          </EntradaSuave>
        )}

        {listo && !error && canje && (
          <View style={estilos.cuerpo}>
            <EntradaSuave>
              <Encabezado />
            </EntradaSuave>
            <EntradaSuave demora={120}>
              <TarjetaProducto canje={canje} producto={producto} />
            </EntradaSuave>
            <EntradaSuave demora={220}>
              <ResumenTransaccion canje={canje} puntosActuales={puntosActuales} />
            </EntradaSuave>
          </View>
        )}

        {listo && (
          <EntradaSuave demora={320}>
            <BotonPrimario label="Volver al inicio" onPress={volverAlInicio} />
          </EntradaSuave>
        )}
      </ScrollView>

      {/* La capa verde va encima de todo y desaparece al terminar la transición */}
      {!transicionTerminada && <CapaVerde escala={escala} opacidad={opacidad} />}
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
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },
  cargando: {
    marginTop: 120,
  },
  cuerpo: {
    gap: 16,
  },

  // --- Encabezado (mismo estilo que la verificación de código)
  encabezado: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  descripcion: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
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
    width: 60,
    height: 60,
    overflow: 'hidden',
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
  },
  productoImagenInterna: {
    width: 60,
    height: 60,
  },
  productoTextos: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  productoNombre: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: COLORES.gris900,
  },
  chipCategoria: {
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.verde100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipCategoriaTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: COLORES.verde700,
  },

  // --- Filas de la operación
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

  // --- Sin canjes
  sinCanjes: {
    gap: 8,
    paddingTop: 80,
  },
})
