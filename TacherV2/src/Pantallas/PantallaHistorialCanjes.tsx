import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Gift } from 'lucide-react-native'
import { CabeceraHistorial } from 'src/components/CabeceraHistorial'
import { EsqueletoReciclajes } from 'src/components/EsqueletoReciclajes'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { useHistorialCanjesPaginado } from 'src/hooks/useHistorialCanjesPaginado'
import { useTotalesHistorial } from 'src/hooks/useTotalesHistorial'
import { obtenerTotalesCanjes } from 'src/services/canjes'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'
import { formatearFecha } from 'src/utils/fechas'
import type { CanjeHistorial } from 'src/services/canjes'

/** Un canje en su propia tarjeta: foto del producto, nombre y fecha, y los puntos usados. */
function ItemCanje({ canje }: { canje: CanjeHistorial }) {
  const puntos = canje.puntosCanjeados.toLocaleString('es-AR')
  const fecha = formatearFecha(canje.fecha)
  return (
    <View
      style={estilos.tarjeta}
      accessible
      accessibilityLabel={`${canje.producto}, ${fecha}, menos ${puntos} puntos`}
    >
      <View style={estilos.imagenContenedor}>
        <ImagenProducto uri={canje.imagen ?? null} tamañoIcono={26} style={estilos.imagen} />
      </View>

      <View style={estilos.filaTextos}>
        <Text style={estilos.producto} numberOfLines={1}>
          {canje.producto}
        </Text>
        <View style={estilos.detalle}>
          <View style={estilos.chip}>
            <Text style={estilos.chipTexto}>Canjeado</Text>
          </View>
          <Text style={estilos.fecha} numberOfLines={1}>
            {fecha}
          </Text>
        </View>
      </View>

      <View style={estilos.puntosPildora}>
        <Text style={estilos.puntosNumero}>-{puntos}</Text>
        <Text style={estilos.puntosUnidad}>pts</Text>
      </View>
    </View>
  )
}

function EstadoVacio() {
  return (
    <View style={estilos.vacio}>
      <View style={estilos.vacioIcono}>
        <Gift size={44} color={COLORES.principal} />
      </View>
      <Text style={estilos.vacioTitulo}>Todavía no hiciste canjes</Text>
      <Text style={estilos.vacioTexto}>
        Cuando canjees un producto en el kiosco, tus canjes van a aparecer acá.
      </Text>
    </View>
  )
}

function PieCargandoMas({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <View style={estilos.pieCargando}>
      <ActivityIndicator size="small" color={COLORES.principal} />
      <Text style={estilos.pieCargandoTexto}>Cargando más...</Text>
    </View>
  )
}

export function PantallaHistorialCanjes() {
  const { userData, navigate } = useApp()
  const { canjes, cargandoInicial, cargandoMas, error, hayMas, refrescando, cargarMas, refrescar } =
    useHistorialCanjesPaginado(userData?.id, 10)

  // Totales de todo el historial (la lista se carga de a 10: sumarla daría un número incompleto)
  const totales = useTotalesHistorial(obtenerTotalesCanjes, userData?.id, refrescando)

  const renderItem = ({ item }: { item: CanjeHistorial }) => <ItemCanje canje={item} />

  const renderHeader = () => (
    <CabeceraHistorial
      icono={Gift}
      etiqueta="Historial"
      titulo="Tus canjes"
      descripcion="Los productos que retiraste en el kiosco con tus puntos."
      metricas={[
        {
          etiqueta: totales?.cantidad === 1 ? 'Canje' : 'Canjes',
          valor: totales ? totales.cantidad.toLocaleString('es-AR') : '—',
        },
        { etiqueta: 'Puntos gastados', valor: totales ? `-${totales.puntos.toLocaleString('es-AR')}` : '—' },
      ]}
      tituloLista="Canjes recientes"
    />
  )

  const renderEmpty = () => {
    if (cargandoInicial) return <EsqueletoReciclajes />
    if (error) return <MensajeError message={error} />
    return <EstadoVacio />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Historial de canjes" onBack={() => navigate('canjes')} />
      <FlatList
        data={cargandoInicial || error ? [] : canjes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={<PieCargandoMas visible={cargandoMas && hayMas} />}
        onEndReached={() => {
          if (!cargandoInicial && !cargandoMas && hayMas) {
            cargarMas()
          }
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={refrescar}
            colors={[COLORES.principal]}
            tintColor={COLORES.principal}
          />
        }
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    borderRadius: RADIOS.medio,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...SOMBRAS.chica,
  },
  detalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Mismos colores que la pastilla de puntos de cada canje
  chip: {
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipTexto: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    color: COLORES.principalOscuro,
  },
  imagenContenedor: {
    width: 52,
    height: 52,
    borderRadius: RADIOS.medio,
    overflow: 'hidden',
    backgroundColor: COLORES.suave,
  },
  imagen: {
    width: 52,
    height: 52,
  },
  filaTextos: {
    flex: 1,
    gap: 5,
  },
  producto: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORES.texto,
  },
  fecha: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  puntosPildora: {
    minWidth: 60,
    alignItems: 'center',
    borderRadius: RADIOS.chico,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  puntosNumero: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: COLORES.principalOscuro,
  },
  puntosUnidad: {
    fontSize: 11,
    lineHeight: 14,
    color: COLORES.textoSuave,
  },
  vacio: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  vacioIcono: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.grande,
    backgroundColor: COLORES.suave,
  },
  vacioTitulo: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: COLORES.texto,
  },
  vacioTexto: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
    paddingHorizontal: 16,
  },
  pieCargando: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  pieCargandoTexto: {
    fontSize: 14,
    color: COLORES.textoSuave,
  },
})