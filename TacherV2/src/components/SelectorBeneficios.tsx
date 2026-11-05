import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronRight, Gift, Lock } from 'lucide-react-native'
import { useApp } from 'src/context/AppContext'
import {
  BENEFICIOS,
  estaDesbloqueado,
  getBeneficioInicial,
  getTextoOferta,
} from 'src/domain/beneficios'
import { COLORES, SOMBRAS } from 'src/theme'

/** Selector de los beneficios por nivel. Arranca en el último que alcanzan los reciclajes del usuario. */
export function SelectorBeneficios({ reciclajes }: { reciclajes: number }) {
  const { abrirEnDesarrollo } = useApp()
  const [idElegido, setIdElegido] = useState<string | null>(null)

  const beneficio =
    BENEFICIOS.find((opcion) => opcion.id === idElegido) ?? getBeneficioInicial(reciclajes)
  const desbloqueado = estaDesbloqueado(beneficio, reciclajes)
  const oferta = getTextoOferta(beneficio)

  return (
    <View style={estilos.contenedor}>
      {/* Encabezado: mismo estilo que la tarjeta superior de Canjes */}
      <View style={estilos.encabezado}>
        <View pointerEvents="none" style={estilos.encabezadoCirculo} />

        <View style={estilos.encabezadoIcono}>
          <Gift size={24} color={COLORES.blanco} />
        </View>
        <View style={estilos.encabezadoTextos}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Beneficios
          </Text>
          <Text style={estilos.subtitulo}>Descuentos que desbloqueás con tus reciclajes.</Text>
        </View>
      </View>

      {/* Pestañas de niveles */}
      <View style={estilos.opciones} accessibilityRole="tablist">
        {BENEFICIOS.map((opcion) => {
          const activa = opcion.id === beneficio.id
          const bloqueada = !estaDesbloqueado(opcion, reciclajes)
          return (
            <TouchableOpacity
              key={opcion.id}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel={`Beneficio ${opcion.nivel}${bloqueada ? ', bloqueado' : ''}`}
              accessibilityState={{ selected: activa }}
              onPress={() => setIdElegido(opcion.id)}
              style={[estilos.opcion, activa && estilos.opcionActiva]}
            >
              {bloqueada && <Lock size={12} color={COLORES.blanco} />}
              <Text style={estilos.opcionTexto} numberOfLines={1} adjustsFontSizeToFit>
                {opcion.nivel}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Tarjeta del nivel elegido: mismo estilo que la tarjeta de puntos del Inicio */}
      <View style={estilos.tarjeta}>
        <View pointerEvents="none" style={estilos.circuloDecorativoGrande} />
        <View pointerEvents="none" style={estilos.circuloDecorativoChico} />

        <View style={estilos.tarjetaEncabezado}>
          <Text style={estilos.nivel}>Nivel {beneficio.nivel}</Text>
          {desbloqueado && (
            <View style={estilos.pildoraOferta}>
              <Text style={estilos.pildoraOfertaTexto}>{oferta}</Text>
            </View>
          )}
        </View>
        <Text style={estilos.beneficio}>{beneficio.titulo}</Text>

        {desbloqueado ? (
          <>
            <Text style={estilos.detalle}>{beneficio.detalle}</Text>
            <View style={estilos.productos}>
              {beneficio.productos.map((nombre, indice) => (
                <TouchableOpacity
                  key={`${nombre}-${indice}`}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${nombre}, ${oferta}`}
                  onPress={() => abrirEnDesarrollo(`${nombre} · ${oferta}`)}
                  style={estilos.botonProducto}
                >
                  <View style={estilos.botonProductoIcono}>
                    <Gift size={18} color={COLORES.blanco} />
                  </View>
                  <Text style={estilos.botonProductoNombre} numberOfLines={2}>
                    {nombre}
                  </Text>
                  <Text style={estilos.botonProductoOferta}>{oferta}</Text>
                  <ChevronRight size={18} color={COLORES.sobreOscuro} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={estilos.bloqueado}>
            <View style={estilos.botonProductoIcono}>
              <Lock size={18} color={COLORES.acento} />
            </View>
            <Text style={estilos.bloqueadoTexto}>Desbloquea el beneficio sumando reciclajes</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const BLANCO_SUAVE = 'rgba(255,255,255,0.18)'

const estilos = StyleSheet.create({
  contenedor: {
    gap: 14,
  },

  // Encabezado
  encabezado: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORES.suave,
    backgroundColor: COLORES.principal,
    padding: 20,
    ...SOMBRAS.media,
  },
  encabezadoCirculo: {
    position: 'absolute',
    right: -40,
    top: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORES.oscuro,
    opacity: 0.25,
  },
  encabezadoIcono: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: BLANCO_SUAVE,
  },
  encabezadoTextos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: COLORES.blanco,
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.blanco,
  },

  // Pestañas (cápsulas, como los filtros de Canjes)
  opciones: {
    flexDirection: 'row',
    gap: 6,
  },
  opcion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: COLORES.suave,
    backgroundColor: COLORES.principal,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  opcionActiva: {
    borderColor: COLORES.acento,
    backgroundColor: COLORES.oscuro,
  },
  opcionTexto: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.blanco,
  },

  // Tarjeta del beneficio elegido
  tarjeta: {
    overflow: 'hidden',
    gap: 6,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.oscuro,
    padding: 24,
    ...SOMBRAS.media,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    right: -50,
    top: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORES.principal,
    opacity: 0.45,
  },
  circuloDecorativoChico: {
    position: 'absolute',
    right: 20,
    bottom: -70,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORES.principal,
    opacity: 0.25,
  },
  tarjetaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  nivel: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.sobreOscuro,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  pildoraOferta: {
    borderRadius: 9999,
    backgroundColor: COLORES.acento,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pildoraOfertaTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: COLORES.oscuro,
  },
  beneficio: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: COLORES.blanco,
  },
  detalle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.sobreOscuro,
  },
  productos: {
    gap: 10,
    marginTop: 12,
  },
  botonProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORES.principal,
    backgroundColor: BLANCO_SUAVE,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  botonProductoIcono: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORES.principal,
  },
  botonProductoNombre: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.blanco,
  },
  botonProductoOferta: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: COLORES.acento,
  },
  bloqueado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORES.principal,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bloqueadoTexto: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.blanco,
  },
})
