import React, { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Coins, History, Lock, X, QrCode } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { Encabezado } from 'src/components/Encabezado'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { MensajeError } from 'src/components/MensajeError'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { useApp } from 'src/context/AppContext'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useProductos } from 'src/hooks/useProductos'
import { COLORES, SOMBRAS } from 'src/theme'
import type { Producto } from 'src/types'
import { EsqueletoProductos } from 'src/components/EsqueletoProductos'

function TarjetaPuntosSuperior({ puntos, onCanjesHistorial }: { puntos: number; onCanjesHistorial: () => void }) {
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

        <TouchableOpacity activeOpacity={0.8} onPress={onCanjesHistorial} style={estilos.botonHistorial}>
          <History size={18} color={COLORES.blanco} />
          <Text style={estilos.textoBotonHistorial}>Mis canjes</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

interface FiltroCategoriasProps {
  categorias: string[]
  seleccionada: string | null
  onSeleccionar: (categoria: string | null) => void
}

function FiltroCategorias({ categorias, seleccionada, onSeleccionar }: FiltroCategoriasProps) {
  const opciones: Array<string | null> = [null, ...categorias]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.filtros}
    >
      {opciones.map((opcion) => {
        const activa = opcion === seleccionada
        return (
          <TouchableOpacity
            key={opcion ?? 'todos'}
            activeOpacity={0.8}
            onPress={() => onSeleccionar(opcion)}
            style={[estilos.chip, activa && estilos.chipActivo]}
          >
            <Text style={[estilos.textoChip, activa && estilos.textoChipActivo]}>
              {opcion ?? 'Todos'}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

interface TarjetaProductoProps {
  producto: Producto
  puntosDelUsuario: number
  onPress: () => void
}

function TarjetaProducto({ producto, puntosDelUsuario, onPress }: TarjetaProductoProps) {
  const puntosFaltantes = Math.max(0, producto.puntos - puntosDelUsuario)
  const bloqueado = puntosFaltantes > 0

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[estilos.tarjetaProducto, bloqueado && estilos.tarjetaProductoBloqueada]}
    >
      <View style={estilos.contenedorImagen}>
        <ImagenProducto uri={producto.imagen} style={estilos.imagenProducto} />
      </View>
      <View style={estilos.cuerpoProducto}>
        <Text style={estilos.nombreProducto} numberOfLines={2}>
          {producto.nombre}
        </Text>
        <View style={estilos.seccionPrecio}>
          <View
            style={[
              estilos.pildoraPrecio,
              bloqueado ? estilos.pildoraPrecioBloqueado : estilos.pildoraPrecioDisponible,
            ]}
          >
            {bloqueado ? (
              <Lock size={14} color={COLORES.avisoOscuro} />
            ) : (
              <Coins size={14} color={COLORES.principalOscuro} />
            )}
            <Text
              style={[
                estilos.textoPrecio,
                bloqueado ? estilos.textoPrecioBloqueado : estilos.textoPrecioDisponible,
              ]}
            >
              {producto.puntos.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

interface CuadriculaProductosProps {
  productos: Producto[]
  puntosDelUsuario: number
  cargando: boolean
  error: string
  onSeleccionar: (producto: Producto) => void
}

function CuadriculaProductos({
  productos,
  puntosDelUsuario,
  cargando,
  error,
  onSeleccionar,
}: CuadriculaProductosProps) {
  if (cargando) return <EsqueletoProductos />
  if (error) return <MensajeError message={error} />
  if (productos.length === 0) {
    return (
      <View style={estilos.vacio}>
        <Text style={estilos.vacioTexto}>Todavía no hay productos disponibles.</Text>
      </View>
    )
  }

  return (
    <View style={estilos.cuadricula}>
      {productos.map((producto) => (
        <TarjetaProducto
          key={producto.id}
          producto={producto}
          puntosDelUsuario={puntosDelUsuario}
          onPress={() => onSeleccionar(producto)}
        />
      ))}
    </View>
  )
}

export function PantallaCanjes() {
  const { userData, navigate, seleccionarProducto, productoSeleccionado } = useApp()
  const { productos, cargando, error } = useProductos()
  const handleTabPress = useNavegacionPestañas()
  const [categoria, setCategoria] = useState<string | null>(null)

  const puntos = Number(userData?.Puntos) || 0

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))),
    [productos],
  )
  const productosVisibles = categoria ? productos.filter((p) => p.categoria === categoria) : productos

  // Cálculos para el modal de detalle
  const puntosDelUsuario = puntos
  const puntosFaltantes = productoSeleccionado ? Math.max(0, productoSeleccionado.puntos - puntosDelUsuario) : 0
  const alcanzanLosPuntos = puntosFaltantes === 0

  const handleGenerarQr = () => {
    if (!alcanzanLosPuntos) return
    
    navigate('generar-qr')
  }

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <TarjetaPuntosSuperior puntos={puntos} onCanjesHistorial={() => navigate('historial-canjes')} />

        {categorias.length > 1 && (
          <FiltroCategorias
            categorias={categorias}
            seleccionada={categoria}
            onSeleccionar={setCategoria}
          />
        )}

        <CuadriculaProductos
          productos={productosVisibles}
          puntosDelUsuario={puntos}
          cargando={cargando}
          error={error}
          onSeleccionar={seleccionarProducto}
        />
      </ScrollView>

      <BarraDeNavegacion activeTab="canjes" onTabPress={handleTabPress} />

      {/* MODAL FLOTANTE SUPERPUESTO (Detalle de Canje) */}
      {productoSeleccionado && (
        <View style={estilos.contenedorOverlay}>
          <View style={estilos.modalCard}>
            
            {/* Cabecera con botón X a la izquierda y título centrado */}
            <View style={estilos.cabeceraModal}>
              <TouchableOpacity onPress={() => seleccionarProducto(null)} style={estilos.botonCerrar}   activeOpacity={0.7}>
                <X size={24} color={COLORES.gris900 || '#111827'} />
              </TouchableOpacity>
              <Text style={estilos.tituloCabecera}>Detalle de canje</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Contenido scrolleable del modal */}
            <ScrollView contentContainerStyle={estilos.contenidoModal} showsVerticalScrollIndicator={false}>
              <ImagenProducto uri={productoSeleccionado.imagen} style={estilos.imagenModal} />

              <View style={estilos.datosModal}>
                <View
                  style={[
                    estilos.chipPuntosModal,
                    !alcanzanLosPuntos ? estilos.chipPuntosBloqueado : estilos.chipPuntosDisponible,
                  ]}
                >
                  {!alcanzanLosPuntos ? (
                    <Lock size={16} color={COLORES.avisoOscuro || '#7A4A00'} />
                  ) : (
                    <Coins size={16} color={COLORES.verde700 || '#047857'} />
                  )}
                  <Text
                    style={[
                      estilos.textoPuntosModal,
                      !alcanzanLosPuntos ? estilos.textoPuntosBloqueado : estilos.textoPuntosDisponible,
                    ]}
                  >
                    {productoSeleccionado.puntos.toLocaleString('es-AR')} Puntos
                  </Text>
                </View>
                <Text style={estilos.nombreModal}>{productoSeleccionado.nombre}</Text>
              </View>


              {/* Barra de progreso y texto de puntos faltantes mejorado */}
              {!alcanzanLosPuntos && (
                <View style={estilos.seccionFaltantesModal}>
                  <Text style={estilos.avisoPuntosModal}>
                    Te {puntosFaltantes === 1 ? 'falta' : 'faltan'}{' '}
                    <Text style={estilos.textoResaltadoFaltante}>
                      {puntosFaltantes.toLocaleString('es-AR')} {puntosFaltantes === 1 ? 'punto' : 'puntos'}
                    </Text>{' '}
                    para canjear este producto.
                  </Text>
                  <View style={estilos.barraProgresoFondo}>
                    <View 
                      style={[
                        estilos.barraProgresoRellenaAmarilla, 
                        { width: `${Math.min(100, (puntosDelUsuario / productoSeleccionado.puntos) * 100)}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Pie con los 2 botones inferiores */}
            <View style={estilos.pieModal}>
              <BotonPrimario
                label="Generar QR"
                icon={
                  <QrCode size={20} color={alcanzanLosPuntos ? COLORES.blanco : COLORES.gris400} />
                }
                disabled={!alcanzanLosPuntos}
                onPress={handleGenerarQr}
              />
              <TouchableOpacity
                style={estilos.botonSecundarioModal}
                activeOpacity={0.8}
                onPress={() => seleccionarProducto(null)}
              >
                <Text style={estilos.textoBotonSecundarioModal}>Ver los demás productos</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
  },

  // Tarjeta superior
  tarjetaSuperior: {
    overflow: 'hidden',
    borderRadius: 24,
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
    borderRadius: 9999,
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

  // Filtros
  filtros: {
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chipActivo: {
    borderColor: COLORES.principal,
    backgroundColor: COLORES.suave,
  },
  textoChip: {
    fontSize: 16,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  textoChipActivo: {
    fontWeight: '600',
    color: COLORES.principalOscuro,
  },

  // Cuadrícula
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  tarjetaProducto: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    overflow: 'hidden',
    padding: 0,
    ...SOMBRAS.chica,
  },
  tarjetaProductoBloqueada: {
    opacity: 0.8,
  },
  contenedorImagen: {
    width: '100%',
    alignSelf: 'stretch',
    height: 220,
    backgroundColor: COLORES.suave,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  imagenProducto: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
  },
  cuerpoProducto: {
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  nombreProducto: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: COLORES.texto,
    textAlign: 'center',
    minHeight: 10,
  },
  seccionPrecio: {
    alignItems: 'center',
  },
  pildoraPrecio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pildoraPrecioDisponible: {
    backgroundColor: '#E8F5E9',
  },
  pildoraPrecioBloqueado: {
    backgroundColor: '#FFF1CC',
  },
  textoPrecio: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  textoPrecioDisponible: {
    color: COLORES.principalOscuro,
  },
  textoPrecioBloqueado: {
    color: COLORES.avisoOscuro,
  },
  vacio: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  vacioTexto: {
    fontSize: 15,
    color: COLORES.textoSuave,
  },

  // --- ESTILOS DEL MODAL SUPERPUESTO (Bottom Sheet) ---
  contenedorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalCard: {
    height: '90%',
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  cabeceraModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  botonCerrar: {
    padding: 4,
  },
  tituloCabecera: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.gris900 || '#111827',
  },
  contenidoModal: {
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  imagenModal: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.verde200 || '#A7F3D0',
    height: 450,
    width: '100%',
  },
  datosModal: {
    gap: 10,
    alignItems: 'center',
  },
  nombreModal: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORES.gris900 || '#111827',
  },
  chipPuntosModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipPuntosDisponible: {
    backgroundColor: COLORES.verde100 || '#ECFDF5',
    borderColor: COLORES.verde200 || '#A7F3D0',
  },
  chipPuntosBloqueado: {
    backgroundColor: '#FFF1CC',
    borderColor: '#FFE082',
  },
  textoPuntosModal: {
    fontSize: 14,
    fontWeight: '700',
  },
  textoPuntosDisponible: {
    color: COLORES.verde700 || '#047857',
  },
  textoPuntosBloqueado: {
    color: COLORES.avisoOscuro || '#7A4A00',
  },
  seccionDescripcionModal: {
    alignItems: 'center',
  },
  descripcionModal: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: COLORES.gris600 || '#4B5563',
  },
  seccionFaltantesModal: {
    gap: 8,
    marginTop: 4,
  },
  barraProgresoFondo: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresoRellenaAmarilla: {
    height: '100%',
    backgroundColor: '#F59E0B', // Color amarillo/ámbar de advertencia
    borderRadius: 4,
  },
  avisoPuntosModal: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORES.gris600 || '#4B5563',
  },
  textoResaltadoFaltante: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706', // Amarillo oscuro / ámbar resaltado
  },
  pieModal: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  botonSecundarioModal: {
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.blanco,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonSecundarioModal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.principal,
  },
})
