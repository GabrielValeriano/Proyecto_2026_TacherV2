import React, { useMemo } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Recycle } from 'lucide-react-native'
import { EsqueletoReciclajes } from 'src/components/EsqueletoReciclajes'
import { ItemHistorialReciclaje } from 'src/components/ItemHistorialReciclaje'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { useReciclajesPaginado } from 'src/hooks/useReciclajesPaginado'
import { COLORES, SOMBRAS } from 'src/theme'
import type { Reciclaje } from 'src/services/reciclajes'

function TarjetaResumen({
  totalReciclajes,
  totalPuntos,
}: {
  totalReciclajes: number
  totalPuntos: number
}) {
  return (
    <View style={estilos.tarjetaResumen}>
      <Text style={estilos.tarjetaTitulo}>Resumen</Text>
      <View style={estilos.resumenFila}>
        <View style={estilos.resumenItem}>
          <Text style={estilos.resumenEtiqueta}>Total reciclajes</Text>
          <Text style={estilos.resumenValor}>{totalReciclajes.toLocaleString('es-AR')}</Text>
        </View>
        <View style={estilos.resumenSeparador} />
        <View style={estilos.resumenItem}>
          <Text style={estilos.resumenEtiqueta}>Puntos ganados</Text>
          <Text style={estilos.resumenValorVerde}>+{totalPuntos.toLocaleString('es-AR')}</Text>
        </View>
      </View>
    </View>
  )
}

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

  const { totalReciclajes, totalPuntos } = useMemo(() => {
    const totalReciclajes = items.length
    const totalPuntos = items.reduce((acc, item) => acc + (Number(item.puntos) || 0), 0)
    return { totalReciclajes, totalPuntos }
  }, [items])

  const renderItem = ({ item, index }: { item: Reciclaje; index: number }) => (
    <ItemHistorialReciclaje reciclaje={item} conDivisor={index < items.length - 1} />
  )

  const renderHeader = () => (
    <View style={estilos.headerContenido}>
      <View style={estilos.titulos}>
        <Text style={estilos.tituloPantalla}>Historial</Text>
        <Text style={estilos.subtituloPantalla}>Tus reciclajes</Text>
      </View>
      <TarjetaResumen totalReciclajes={totalReciclajes} totalPuntos={totalPuntos} />
    </View>
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
  headerContenido: {
    gap: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titulos: {
    gap: 4,
  },
  tituloPantalla: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: COLORES.texto,
  },
  subtituloPantalla: {
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