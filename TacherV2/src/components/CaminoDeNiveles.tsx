import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Check, Lock, MapPin } from 'lucide-react-native'
import { CirculoMarca } from 'src/components/CirculoMarca'
import { BENEFICIOS } from 'src/domain/beneficios'
import { getResumenNivelPorReciclajes, NIVELES, type Nivel } from 'src/domain/niveles'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

type EstadoPaso = 'completado' | 'actual' | 'pendiente'

const TAMANIO_ICONO = 46

const formatear = (numero: number) => numero.toLocaleString('es-AR')
const plural = (n: number, palabra: string) => `${formatear(n)} ${palabra}${n === 1 ? '' : 's'}`

/** El nivel se guarda sin tilde ("Arbol"); acá se muestra bien escrito. */
const nombreDeNivel = (nombre: string) => (nombre === 'Arbol' ? 'Árbol' : nombre)

/**
 * Los niveles de arriba hacia abajo, como un camino: cada paso con su ícono, desde cuántos
 * reciclajes se llega y qué beneficio da. Lo ya conseguido en verde, el nivel actual destacado
 * (con lo que falta para el siguiente) y lo que falta, apagado y con candado.
 */
export function CaminoDeNiveles({ reciclajes }: { reciclajes: number }) {
  const cantidad = Math.max(0, Number(reciclajes) || 0)
  const resumen = getResumenNivelPorReciclajes(cantidad)
  const indiceActual = NIVELES.indexOf(resumen.actual)

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Tu camino de beneficios
        </Text>
        <Text style={estilos.subtitulo}>
          Cada nivel desbloquea un beneficio nuevo en el kiosco. Llevás{' '}
          <Text style={estilos.subtituloFuerte}>{plural(cantidad, 'reciclaje')}</Text>.
        </Text>
      </View>

      <View>
        {NIVELES.map((nivel, indice) => {
          const estado: EstadoPaso =
            indice < indiceActual ? 'completado' : indice === indiceActual ? 'actual' : 'pendiente'
          return (
            <Paso
              key={nivel.name}
              nivel={nivel}
              estado={estado}
              esUltimo={indice === NIVELES.length - 1}
              reciclajes={cantidad}
              progreso={estado === 'actual' ? resumen.progreso : 0}
              proximo={estado === 'actual' ? resumen.proximo : null}
            />
          )
        })}
      </View>
    </View>
  )
}

interface PasoProps {
  nivel: Nivel
  estado: EstadoPaso
  esUltimo: boolean
  reciclajes: number
  /** Solo para el nivel actual: avance hacia el siguiente (0-100). */
  progreso: number
  proximo: Nivel | null
}

function Paso({ nivel, estado, esUltimo, reciclajes, progreso, proximo }: PasoProps) {
  const Icono = nivel.icon
  const beneficio = BENEFICIOS.find((b) => b.id === nivel.name)
  const faltan = Math.max(0, nivel.min - reciclajes)
  const actual = estado === 'actual'
  const pendiente = estado === 'pendiente'

  return (
    <View
      style={estilos.paso}
      accessible
      accessibilityLabel={`${nombreDeNivel(nivel.name)}, desde ${plural(nivel.min, 'reciclaje')}. ${
        beneficio?.titulo ?? ''
      }. ${actual ? 'Tu nivel actual' : pendiente ? `Te faltan ${plural(faltan, 'reciclaje')}` : 'Desbloqueado'}`}
    >
      {/* Columna izquierda: ícono y la línea que lo une con el siguiente */}
      <View style={estilos.columnaIcono}>
        {actual ? (
          <CirculoMarca size={TAMANIO_ICONO} borde={{ color: COLORES.acento, ancho: 3 }}>
            <Icono size={22} color={COLORES.blanco} />
          </CirculoMarca>
        ) : (
          <View style={[estilos.icono, estado === 'completado' ? estilos.iconoCompletado : estilos.iconoPendiente]}>
            <Icono size={22} color={estado === 'completado' ? COLORES.blanco : COLORES.gris400} />
            {estado === 'completado' && (
              <View style={estilos.tilde}>
                <Check size={10} strokeWidth={3.5} color={COLORES.oscuro} />
              </View>
            )}
          </View>
        )}
        {!esUltimo && (
          <View style={[estilos.linea, estado === 'completado' ? estilos.lineaCompletada : estilos.lineaPendiente]} />
        )}
      </View>

      {/* Columna derecha: datos del nivel */}
      <View style={[estilos.detalle, actual && estilos.detalleActual, !esUltimo && estilos.detalleConEspacio]}>
        <View style={estilos.detalleFila}>
          <Text style={[estilos.nombre, pendiente && estilos.textoApagado]}>{nombreDeNivel(nivel.name)}</Text>
          <Estado estado={estado} faltan={faltan} />
        </View>

        <Text style={[estilos.requisito, pendiente && estilos.textoApagado]}>
          {nivel.min === 0 ? 'Desde tu primer reciclaje' : `Desde ${plural(nivel.min, 'reciclaje')}`}
        </Text>

        {beneficio && (
          <View style={[estilos.beneficio, pendiente && estilos.beneficioPendiente]}>
            <Text style={[estilos.beneficioTitulo, pendiente && estilos.textoApagado]}>{beneficio.titulo}</Text>
            <Text style={[estilos.beneficioProductos, pendiente && estilos.textoApagado]} numberOfLines={2}>
              {beneficio.productos.join(' · ')}
            </Text>
          </View>
        )}

        {actual && (
          <View style={estilos.progreso}>
            <View
              style={estilos.barra}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: progreso }}
            >
              <View style={[estilos.barraRelleno, { width: `${progreso}%` }]} />
            </View>
            <Text style={estilos.progresoTexto}>
              {proximo
                ? `Te faltan ${plural(Math.max(0, proximo.min - reciclajes), 'reciclaje')} para ${nombreDeNivel(proximo.name)}`
                : '¡Llegaste al nivel máximo!'}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

function Estado({ estado, faltan }: { estado: EstadoPaso; faltan: number }) {
  if (estado === 'actual') {
    return (
      <View style={[estilos.chip, estilos.chipActual]}>
        <MapPin size={12} strokeWidth={2.5} color={COLORES.oscuro} />
        <Text style={[estilos.chipTexto, estilos.chipTextoActual]}>Estás acá</Text>
      </View>
    )
  }
  if (estado === 'completado') {
    return (
      <View style={[estilos.chip, estilos.chipCompletado]}>
        <Check size={12} strokeWidth={3} color={COLORES.principalOscuro} />
        <Text style={[estilos.chipTexto, estilos.chipTextoCompletado]}>Desbloqueado</Text>
      </View>
    )
  }
  return (
    <View style={[estilos.chip, estilos.chipPendiente]}>
      <Lock size={11} strokeWidth={2.5} color={COLORES.gris600} />
      <Text style={[estilos.chipTexto, estilos.chipTextoPendiente]}>Faltan {formatear(faltan)}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  tarjeta: {
    gap: 18,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    ...SOMBRAS.media,
  },
  cabecera: {
    gap: 4,
  },
  titulo: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORES.texto,
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  subtituloFuerte: {
    fontWeight: '700',
    color: COLORES.principalOscuro,
  },

  // --- Cada paso
  paso: {
    flexDirection: 'row',
    gap: 14,
  },
  columnaIcono: {
    width: TAMANIO_ICONO,
    alignItems: 'center',
  },
  icono: {
    width: TAMANIO_ICONO,
    height: TAMANIO_ICONO,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TAMANIO_ICONO / 2,
  },
  iconoCompletado: {
    backgroundColor: COLORES.principal,
  },
  iconoPendiente: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORES.gris400,
    backgroundColor: COLORES.fondo,
  },
  tilde: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORES.blanco,
    backgroundColor: COLORES.acento,
  },
  linea: {
    flex: 1,
    width: 3,
    minHeight: 18,
    marginVertical: 4,
    borderRadius: 2,
  },
  lineaCompletada: {
    backgroundColor: COLORES.principal,
  },
  lineaPendiente: {
    backgroundColor: COLORES.gris200,
  },

  detalle: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  detalleConEspacio: {
    marginBottom: 16,
  },
  // El nivel actual va en su propia tarjetita para que se vea de un vistazo
  detalleActual: {
    borderRadius: RADIOS.medio,
    borderWidth: 1.5,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.fondo,
    padding: 12,
    paddingTop: 10,
  },
  detalleFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  nombre: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: COLORES.texto,
  },
  requisito: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORES.textoSuave,
  },
  // Apagado pero legible: gris400 sobre blanco no llega al contraste mínimo
  textoApagado: {
    color: COLORES.gris500,
  },

  beneficio: {
    marginTop: 6,
    gap: 2,
    borderRadius: RADIOS.chico,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  beneficioPendiente: {
    backgroundColor: COLORES.fondo,
  },
  beneficioTitulo: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: COLORES.principalOscuro,
  },
  beneficioProductos: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.gris600,
  },

  // --- Chip de estado
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  chipActual: {
    backgroundColor: COLORES.acento,
  },
  chipCompletado: {
    backgroundColor: COLORES.suave,
  },
  chipPendiente: {
    backgroundColor: COLORES.gris200,
  },
  chipTexto: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  chipTextoActual: {
    color: COLORES.oscuro,
  },
  chipTextoCompletado: {
    color: COLORES.principalOscuro,
  },
  chipTextoPendiente: {
    color: COLORES.gris600,
  },

  // --- Progreso hacia el siguiente nivel (solo en el actual)
  progreso: {
    marginTop: 8,
    gap: 6,
  },
  barra: {
    height: 8,
    overflow: 'hidden',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.gris200,
  },
  barraRelleno: {
    height: '100%',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.principal,
  },
  progresoTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.principalOscuro,
  },
})
