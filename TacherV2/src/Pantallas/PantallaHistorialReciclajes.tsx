import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Recycle } from 'lucide-react-native'
import { CabeceraHistorial } from 'src/components/CabeceraHistorial'
import { EsqueletoReciclajes } from 'src/components/EsqueletoReciclajes'
import { ItemHistorialReciclaje } from 'src/components/ItemHistorialReciclaje'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { useReciclajesPaginado } from 'src/hooks/useReciclajesPaginado'
import { useTotalesHistorial } from 'src/hooks/useTotalesHistorial'
import { obtenerTotalesReciclajes } from 'src/services/reciclajes'
import { COLORES, RADIOS } from 'src/theme'
import type { Reciclaje } from 'src/services/reciclajes'

function EstadoVacio() {
  return (
    <View style={estilos.vacioContenedor}>
      <View style={estilos.vacioIcono}>
        <Recycle size={44} color={COLORES.principal} />
      </View>
      <Text style={estilos.vacioTitulo}>Todavía no hay reciclajes</Text>
      <Text style={estilos.vacioTexto}>
        Cuando recicles con la caja TacherV2, tus registros aparecerán acá.
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

export function PantallaHistorialReciclajes() {
  const { userData, navigate } = useApp()
  const { items, cargandoInicial, cargandoMas, error, hayMas, refrescando, cargarMas, refrescar } =
    useReciclajesPaginado(userData?.id, 10)

  // Totales de todo el historial (la lista se carga de a 10: sumarla daría un número incompleto)
  const totales = useTotalesHistorial(obtenerTotalesReciclajes, userData?.id, refrescando)
  const totalReciclajes = totales?.cantidad ?? Math.max(0, Number(userData?.reciclajes) || 0)

  const renderItem = ({ item }: { item: Reciclaje }) => <ItemHistorialReciclaje reciclaje={item} />

  const renderHeader = () => (
    <CabeceraHistorial
      icono={Recycle}
      etiqueta="Historial"
      titulo="Tus reciclajes"
      descripcion="Cada residuo que dejás en la caja TacherV2 suma puntos para canjear."
      metricas={[
        { etiqueta: totalReciclajes === 1 ? 'Reciclaje' : 'Reciclajes', valor: totalReciclajes.toLocaleString('es-AR') },
        { etiqueta: 'Puntos ganados', valor: totales ? `+${totales.puntos.toLocaleString('es-AR')}` : '—' },
      ]}
      tituloLista="Actividad reciente"
    />
  )

  const renderEmpty = () => {
    if (cargandoInicial) return <EsqueletoReciclajes />
    if (error) return <MensajeError message={error} />
    return <EstadoVacio />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Historial de reciclajes" onBack={() => navigate('home')} />
      <FlatList
        data={cargandoInicial || error ? [] : items}
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
  vacioContenedor: {
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