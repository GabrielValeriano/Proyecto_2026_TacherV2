import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { Bell, Gift, Recycle, type LucideIcon } from 'lucide-react-native'
import { EsqueletoReciclajes } from 'src/components/EsqueletoReciclajes'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { marcarComoLeidas } from 'src/services/notificaciones'
import { COLORES, SOMBRAS, RADIOS } from 'src/theme'
import type { Notificacion, TipoNotificacion } from 'src/types'
import { formatearHaceCuanto } from 'src/utils/fechas'

const ICONOS: Record<TipoNotificacion, LucideIcon> = {
  reciclaje: Recycle,
  canje: Gift,
  general: Bell,
}

function TituloDecorado({ nuevas }: { nuevas: number }) {
  return (
    <View style={estilos.titulo}>
      <View style={estilos.circuloDecorativoGrande} />
      <View style={estilos.circuloDecorativoChico} />

      <View style={estilos.tituloIcono}>
        <Bell size={26} color={COLORES.blanco} />
      </View>
      <View style={estilos.tituloTextos}>
        <Text style={estilos.tituloTexto}>Notificaciones</Text>
        <Text style={estilos.tituloSubtexto}>Tus reciclajes y canjes, al instante</Text>
      </View>
      {nuevas > 0 && (
        <View style={estilos.chipNuevas}>
          <Text style={estilos.chipNuevasTexto}>
            {nuevas} {nuevas === 1 ? 'nueva' : 'nuevas'}
          </Text>
        </View>
      )}
    </View>
  )
}

function ItemNotificacion({ notificacion, nueva }: { notificacion: Notificacion; nueva: boolean }) {
  const Icono = ICONOS[notificacion.tipo]
  return (
    <View style={[estilos.item, nueva && estilos.itemNuevo]}>
      <View style={estilos.itemIcono}>
        <Icono size={24} color={COLORES.principal} />
      </View>
      <View style={estilos.itemTextos}>
        <View style={estilos.itemFilaTitulo}>
          <Text style={estilos.itemTitulo} numberOfLines={1}>
            {notificacion.titulo}
          </Text>
          {nueva && <View style={estilos.puntoNuevo} />}
        </View>
        {notificacion.mensaje !== '' && (
          <Text style={estilos.itemMensaje} numberOfLines={2}>
            {notificacion.mensaje}
          </Text>
        )}
        <Text style={estilos.itemFecha}>{formatearHaceCuanto(notificacion.fecha)}</Text>
      </View>
    </View>
  )
}

function EstadoVacio() {
  return (
    <View style={estilos.vacio}>
      <View style={estilos.vacioIcono}>
        <Bell size={44} color={COLORES.principal} />
      </View>
      <Text style={estilos.vacioTitulo}>No tenés notificaciones</Text>
      <Text style={estilos.vacioTexto}>
        Cuando recicles en la caja TacherV2 o canjees un producto, te avisamos acá.
      </Text>
    </View>
  )
}

export function PantallaNotificaciones() {
  const { navigate, userData, notificaciones, cargandoNotificaciones, errorNotificaciones } =
    useApp()
  const uid = userData?.id

  // Las que estaban sin leer al entrar (o llegaron con la pantalla abierta) se resaltan
  // mientras el usuario está acá, aunque ya se hayan marcado como leídas en Firestore.
  const [nuevas, setNuevas] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!uid) return
    const sinLeer = notificaciones.filter((n) => !n.leida).map((n) => n.id)
    if (sinLeer.length === 0) return

    setNuevas((anteriores) => new Set([...anteriores, ...sinLeer]))
    marcarComoLeidas(uid, sinLeer).catch((error) =>
      console.error('No se pudieron marcar las notificaciones como leídas:', error),
    )
  }, [notificaciones, uid])

  const renderVacio = () => {
    if (cargandoNotificaciones) return <EsqueletoReciclajes cantidad={4} />
    if (errorNotificaciones) return <MensajeError message={errorNotificaciones} />
    return <EstadoVacio />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Notificaciones" onBack={() => navigate('home')} />
      <FlatList
        data={cargandoNotificaciones || errorNotificaciones ? [] : notificaciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemNotificacion notificacion={item} nueva={nuevas.has(item.id)} />}
        ListHeaderComponent={<TituloDecorado nuevas={nuevas.size} />}
        ListEmptyComponent={renderVacio}
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
    flexGrow: 1,
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // --- Título decorado
  titulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    marginBottom: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.oscuro,
    padding: 18,
    ...SOMBRAS.media,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circuloDecorativoChico: {
    position: 'absolute',
    bottom: -30,
    right: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tituloIcono: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORES.principal,
  },
  tituloTextos: {
    flex: 1,
    gap: 2,
  },
  tituloTexto: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: COLORES.blanco,
  },
  tituloSubtexto: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.sobreOscuro,
  },
  chipNuevas: {
    borderRadius: 12,
    backgroundColor: COLORES.acento,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipNuevasTexto: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: COLORES.oscuro,
  },

  // --- Ítem
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 14,
    ...SOMBRAS.chica,
  },
  itemNuevo: {
    borderColor: COLORES.principal,
    backgroundColor: COLORES.suave,
  },
  itemIcono: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
  },
  itemTextos: {
    flex: 1,
    gap: 3,
  },
  itemFilaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitulo: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  puntoNuevo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORES.principal,
  },
  itemMensaje: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  itemFecha: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.gris400,
  },

  // --- Vacío
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
})
