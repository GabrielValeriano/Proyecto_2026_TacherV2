import React, { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Coins, History } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { Encabezado } from 'src/components/Encabezado'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { MensajeError } from 'src/components/MensajeError'
import { useApp } from 'src/context/AppContext'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useProductos } from 'src/hooks/useProductos'
import { COLORES, SOMBRAS } from 'src/theme'
import type { Producto } from 'src/types'

/** Componente Skeleton individual para cada tarjeta de producto */
function TarjetaProductoSkeleton() {
  return (
    <View style={estilos.tarjetaProducto}>
      {/* Marcador de posición para la imagen */}
      <View style={[estilos.imagenTarjetaSkeleton, estilos.skeletonBase]} />
      
      {/* Marcador de posición para los textos */}
      <View style={estilos.productoTextos}>
        <View style={[estilos.skeletonBase, estilos.skeletonTextoNombre]} />
        <View style={[estilos.skeletonBase, estilos.skeletonTextoNombreCorto]} />
        
        <View style={estilos.precio}>
          <View style={[estilos.skeletonBase, estilos.skeletonTextoPrecio]} />
        </View>
      </View>
    </View>
  )
}

/** Cuadrícula que renderiza una serie de tarjetas esqueleto en formato 2x2 */
function CuadriculaSkeleton({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <View style={estilos.cuadricula}>
      {Array.from({ length: cantidad }).map((_, indice) => (
        <TarjetaProductoSkeleton key={indice} />
      ))}
    </View>
  )
}

/** Skeleton para los botones de filtrado horizontal por categorías */
function FiltroCategoriasSkeleton() {
  const anchos = [85, 90, 100] // Tamaños variados para simular palabras

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.filtros}
    >
      {anchos.map((ancho, index) => (
        <View
          key={index}
          style={[
            estilos.chip,
            estilos.skeletonBase,
            { width: ancho, height: 48 },
          ]}
        />
      ))}
    </ScrollView>
  )
}

function FilaPuntos({ puntos, onCanjesHistorial }: { puntos: number; onCanjesHistorial: () => void }) {
  return (
    <View style={estilos.filaPuntos}>
      <View style={estilos.pildoraPuntos}>
        <Coins size={30} color={COLORES.acento} />
        <Text style={estilos.textoPildoraPuntos}>{puntos.toLocaleString('es-AR')} Puntos</Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onCanjesHistorial} style={estilos.pildoraReciclajes}>
        <History size={30} color={COLORES.oscuro} />
        <Text style={estilos.textoPildoraReciclajes}>Tus canjes</Text>
      </TouchableOpacity>
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
      activeOpacity={0.8}
      onPress={onPress}
      style={[estilos.tarjetaProducto, bloqueado && estilos.tarjetaBloqueada]}
    >
      <ImagenProducto uri={producto.imagen} style={estilos.imagenTarjeta} />
      <View style={estilos.productoTextos}>
        <Text style={estilos.nombreProducto} numberOfLines={2}>
          {producto.nombre}
        </Text>

        <View style={estilos.precio}>
          <Coins size={18} color={COLORES.principal} />
          <Text style={estilos.puntosProducto}>
            {producto.puntos.toLocaleString('es-AR')} Puntos
          </Text>
        </View>

        {bloqueado && (
          <View style={estilos.insignia}>
            <Text style={estilos.insigniaTexto}>
              Te faltan {puntosFaltantes.toLocaleString('es-AR')} Puntos
            </Text>
          </View>
        )}
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
  if (cargando) {
    return <CuadriculaSkeleton cantidad={3} />
  }
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
  const { userData, abrirEnDesarrollo, seleccionarProducto } = useApp()
  const { productos, cargando, error } = useProductos()
  const handleTabPress = useNavegacionPestañas()
  const [categoria, setCategoria] = useState<string | null>(null)

  const puntos = Number(userData?.Puntos) || 0

  // Los filtros aparecen solo si los productos tienen al menos 2 categorías distintas
  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))),
    [productos],
  )
  const productosVisibles = categoria ? productos.filter((p) => p.categoria === categoria) : productos

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Canjeá tus puntos</Text>

        <FilaPuntos puntos={puntos} onCanjesHistorial={() => abrirEnDesarrollo('Historial de Canjes')} />

        <Text style={estilos.subtitulo}>Productos disponibles</Text>

        {/* Mientras carga mostramos el Skeleton de las categorías */}
        {cargando ? (
          <FiltroCategoriasSkeleton />
        ) : (
          categorias.length > 1 && (
            <FiltroCategorias
              categorias={categorias}
              seleccionada={categoria}
              onSeleccionar={setCategoria}
            />
          )
        )}

        <View style={estilos.seccionProductos}>
          <CuadriculaProductos
            productos={productosVisibles}
            puntosDelUsuario={puntos}
            cargando={cargando}
            error={error}
            onSeleccionar={seleccionarProducto}
          />
        </View>
      </ScrollView>

      <BarraDeNavegacion activeTab="canjes" onTabPress={handleTabPress} />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 18,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 20,
  },
  titulo: {
    fontSize: 35,
    lineHeight: 45,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: COLORES.texto,
  },

  // --- Puntos y botón Reciclajes
  filaPuntos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 8,
    justifyContent: 'space-between',
    rowGap: 10,
  },
  pildoraPuntos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    backgroundColor: COLORES.oscuro,
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  textoPildoraPuntos: {
    fontSize: 21,
    lineHeight: 32,
    fontWeight: '600',
    color: COLORES.blanco,
  },
  pildoraReciclajes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  textoPildoraReciclajes: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
    color: COLORES.oscuro,
  },

  // --- Filtros por categoría
  filtros: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  chipActivo: {
    borderColor: COLORES.oscuro,
    backgroundColor: COLORES.oscuro,
  },
  textoChip: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  textoChipActivo: {
    color: COLORES.blanco,
  },

  // --- Productos disponibles
  seccionProductos: {
    gap: 12,
  },
  subtitulo: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.texto,
  },
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  tarjetaProducto: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    ...SOMBRAS.chica,
  },
  tarjetaBloqueada: {
    opacity: 0.75,
  },
  imagenTarjeta: {
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  productoTextos: {
    padding: 12,
    gap: 6,
  },
  nombreProducto: {
    minHeight: 44,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  precio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  puntosProducto: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.principal,
  },
  insignia: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    backgroundColor: '#FFF1CC',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  insigniaTexto: {
    fontSize: 13,
    lineHeight: 16,
    color: '#7A4A00',
  },

  // --- Estilos Skeleton
  skeletonBase: {
    backgroundColor: COLORES.linea || '#E0E0E0',
    opacity: 0.6,
  },
  imagenTarjetaSkeleton: {
    height: 120,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  skeletonTextoNombre: {
    width: '90%',
    height: 16,
    borderRadius: 4,
  },
  skeletonTextoNombreCorto: {
    width: '50%',
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonTextoPrecio: {
    width: '60%',
    height: 14,
    borderRadius: 4,
  },

  // --- Estados
  vacio: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  vacioTexto: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    color: COLORES.textoSuave,
  },
})