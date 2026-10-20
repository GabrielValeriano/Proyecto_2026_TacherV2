import React from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { IconoBotella } from 'src/components/IconoBotella'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { useReciclajes } from 'src/hooks/useReciclajes'
import type { Reciclaje } from 'src/services/reciclajes'
import { COLORES, SOMBRAS } from 'src/theme'
import { formatearFecha } from 'src/utils/fechas'
import { EsqueletoReciclajes } from 'src/components/EsqueletoReciclajes'

function FilaReciclaje({ reciclaje, conDivisor }: { reciclaje: Reciclaje; conDivisor: boolean }) {
  return (
    <View style={[estilos.fila, conDivisor && estilos.filaConDivisor]}>
      <View style={estilos.iconoTile}>
        <IconoBotella size={28} color={COLORES.principal} />
      </View>

      <View style={estilos.filaTextos}>
        <Text style={estilos.residuo} numberOfLines={1}>
          {reciclaje.residuo}
        </Text>
        <Text style={estilos.fecha}>{formatearFecha(reciclaje.fecha)}</Text>
      </View>

      <View style={estilos.puntosPildora}>
        <Text style={estilos.puntosNumero}>+{reciclaje.puntos.toLocaleString('es-AR')}</Text>
        <Text style={estilos.puntosUnidad}>puntos</Text>
      </View>
    </View>
  )
}

interface ListaReciclajesProps {
  reciclajes: Reciclaje[]
  cargando: boolean
  error: string
}

function ListaReciclajes({ reciclajes, cargando, error }: ListaReciclajesProps) {
  if (cargando) return <EsqueletoReciclajes />
  
  if (error) return <MensajeError message={error} />

  if (reciclajes.length === 0) {
    return (
      <View style={estilos.vacio}>
        <View style={estilos.vacioIcono}>
          <IconoBotella size={44} color={COLORES.principal} />
        </View>
        <Text style={estilos.vacioTitulo}>Todavía no reciclaste</Text>
        <Text style={estilos.vacioTexto}>
          Cuando recicles en la caja TeacherV2, tus reciclajes van a aparecer acá.
        </Text>
      </View>
    )
  }

  return (
    <View style={estilos.lista}>
      {reciclajes.map((reciclaje, indice) => (
        <FilaReciclaje
          key={reciclaje.id}
          reciclaje={reciclaje}
          conDivisor={indice < reciclajes.length - 1}
        />
      ))}
    </View>
  )
}

export function PantallaHistorialReciclajes() {
  const { userData, navigate } = useApp()
  const { reciclajes, cargando, error } = useReciclajes(userData?.id)

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Historial" onBack={() => navigate('home')} />

      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Reciclajes</Text>
          <Text style={estilos.subtitulo}>Estos son tus últimos 10 reciclajes</Text>
        </View>

        <ListaReciclajes reciclajes={reciclajes} cargando={cargando} error={error} />
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 20,
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

  // --- Lista
  lista: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    ...SOMBRAS.chica,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  filaConDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
  },
  iconoTile: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORES.suave,
  },
  filaTextos: {
    flex: 1,
    gap: 2,
  },
  residuo: {
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

  // --- Estados
  cargando: {
    marginVertical: 32,
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
  },
})
