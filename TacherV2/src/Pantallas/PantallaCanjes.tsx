import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Coins, Lock } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { Encabezado } from 'src/components/Encabezado'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { MensajeError } from 'src/components/MensajeError'
import { TarjetaPuntosCanjes } from 'src/components/TarjetaPuntosCanjes'
import { useApp } from 'src/context/AppContext'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useProductos } from 'src/hooks/useProductos'
import { COLORES, SOMBRAS, RADIOS } from 'src/theme'
import type { Producto } from 'src/types'
import { EsqueletoProductos } from 'src/components/EsqueletoProductos'

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
  const { userData, navigate, seleccionarProducto } = useApp()
  const { productos, cargando, error } = useProductos()
  const handleTabPress = useNavegacionPestañas()
  const [categoria, setCategoria] = useState<string | null>(null)

  const puntos = Number(userData?.Puntos) || 0

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))),
    [productos],
  )
  const productosVisibles = categoria ? productos.filter((p) => p.categoria === categoria) : productos

  // Al entrar a Canjes nunca queda un producto elegido de antes (después de un canje o al volver)
  useEffect(() => {
    seleccionarProducto(null)
  }, [])

  const handleSeleccionar = (producto: Producto) => {
    seleccionarProducto(producto)
    navigate('seleccionar-producto')
  }

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <TarjetaPuntosCanjes puntos={puntos} onCanjesHistorial={() => navigate('historial-canjes')} />

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
          onSeleccionar={handleSeleccionar}
        />
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
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
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
    borderRadius: RADIOS.tarjeta,
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
    backgroundColor: COLORES.suave,
  },
  pildoraPrecioBloqueado: {
    backgroundColor: COLORES.aviso50,
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
})
