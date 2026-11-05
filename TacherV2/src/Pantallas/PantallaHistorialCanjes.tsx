import React, { useMemo } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Gift } from 'lucide-react-native'
import { EsqueletoReciclajes } from 'src/components/EsqueletoReciclajes'
import { ImagenProducto } from 'src/components/ImagenProducto'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { useHistorialCanjesPaginado } from 'src/hooks/useHistorialCanjesPaginado'
import { COLORES, SOMBRAS } from 'src/theme'
import { formatearFecha } from 'src/utils/fechas'
import type { CanjeHistorial } from 'src/services/canjes'

function TarjetaResumen({
  totalCanjes,
  totalPuntosCanjeados,
}: {
  totalCanjes: number
  totalPuntosCanjeados: number
}) {
  return (
    <View style={estilos.tarjetaResumen}>
      <Text style={estilos.tarjetaTitulo}>Resumen</Text>
      <View style={estilos.resumenFila}>
        <View style={estilos.resumenItem}>
          <Text style={estilos.resumenEtiqueta}>Total canjes</Text>
          <Text style={estilos.resumenValor}>{totalCanjes.toLocaleString('es-AR')}</Text>
        </View>
        <View style={estilos.resumenSeparador} />
        <View style={estilos.resumenItem}>
          <Text style={estilos.resumenEtiqueta}>Puntos canjeados</Text>
          <Text style={estilos.resumenValorVerde}>-{totalPuntosCanjeados.toLocaleString('es-AR')}</Text>
        </View>
      </View>
    </View>
  )
}

function ItemCanje({ canje, conDivisor }: { canje: CanjeHistorial; conDivisor: boolean }) {
  return (
    <View style={[estilos.fila, conDivisor && estilos.filaConDivisor]}>
      <View style={estilos.imagenContenedor}>
        <ImagenProducto uri={canje.imagen ?? null} tamañoIcono={26} style={estilos.imagen} />
      </View>

      <View style={estilos.filaTextos}>
        <Text style={estilos.producto} numberOfLines={1}>
          {canje.producto}
        </Text>
        <Text style={estilos.fecha}>{formatearFecha(canje.fecha)}</Text>
      </View>

      <View style={estilos.puntosPildora}>
        <Text style={estilos.puntosNumero}>-{canje.puntosCanjeados.toLocaleString('es-AR')}</Text>
        <Text style={estilos.puntosUnidad}>puntos</Text>
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

  const { totalCanjes, totalPuntosCanjeados } = useMemo(() => {
    const totalCanjes = canjes.length
    const totalPuntosCanjeados = canjes.reduce((acc, item) => acc + (Number(item.puntosCanjeados) || 0), 0)
    return { totalCanjes, totalPuntosCanjeados }
  }, [canjes])

  const renderItem = ({ item, index }: { item: CanjeHistorial; index: number }) => (
    <ItemCanje canje={item} conDivisor={index < canjes.length - 1} />
  )

  const renderHeader = () => (
    <View style={estilos.headerContenido}>
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Historial</Text>
        <Text style={estilos.subtitulo}>Tus productos canjeados</Text>
      </View>
      <TarjetaResumen totalCanjes={totalCanjes} totalPuntosCanjeados={totalPuntosCanjeados} />
    </View>
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
  headerContenido: {
    gap: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  encabezado: {
    gap: 4,
  },
  titulo: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: COLORES.texto,
  },
  subtitulo: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORES.textoSuave,
  },
  tarjetaResumen: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    gap: 14,
    ...SOMBRAS.chica,
  },
  tarjetaTitulo: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.texto,
  },
  resumenFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumenItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  resumenSeparador: {
    width: 1,
    height: 48,
    backgroundColor: COLORES.linea,
  },
  resumenEtiqueta: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  resumenValor: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORES.texto,
  },
  resumenValorVerde: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORES.principal,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filaConDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
  },
  imagenContenedor: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORES.suave,
  },
  imagen: {
    width: 52,
    height: 52,
  },
  filaTextos: {
    flex: 1,
    gap: 2,
  },
  producto: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  fecha: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  puntosPildora: {
    minWidth: 68,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: COLORES.suave,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  puntosNumero: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.verde700,
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
    borderRadius: 28,
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
