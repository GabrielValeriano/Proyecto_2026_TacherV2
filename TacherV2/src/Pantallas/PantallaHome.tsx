import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { BookOpen, ChevronRight, Gift, Recycle } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { Encabezado } from 'src/components/Encabezado'
import { useApp } from 'src/context/AppContext'
import { getResumenNivelPorReciclajes } from 'src/domain/niveles'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useSincronizarNivel } from 'src/hooks/useSincronizarNivel'
import { COLORES, SOMBRAS, RADIOS } from 'src/theme'

function Saludo({ nombre }: { nombre: string }) {
  return (
    <View>
        <Text style={estilos.nombreUsuario}>Bienvenido, {nombre}</Text>
    </View>
  )
}

function TarjetaPuntosYCanje({ puntos, onCanjear }: { puntos: number; onCanjear: () => void }) {
  return (
    <View style={estilos.tarjetaPuntos}>
      <View style={estilos.circuloDecorativoGrande} />
      <View style={estilos.circuloDecorativoChico} />

      <View style={estilos.contenidoPuntos}>
        <Text style={estilos.etiquetaPuntosDisponibles}>Puntos Disponibles</Text>
        <View style={estilos.filaPuntosYCanje}>
          <Text style={estilos.puntosGrandes} numberOfLines={1} adjustsFontSizeToFit>
            {puntos.toLocaleString('es-AR')}
          </Text>
          <BotonPrimario
            label="Canjear"
            icon={<Gift size={20} color={COLORES.blanco} />}
            onPress={onCanjear}
            style={estilos.botonCanjear}
          />
        </View>
        <Text style={estilos.subtextoPuntos}>Canjea productos del kiosco</Text>
      </View>
    </View>
  )
}

function TarjetaReciclajes({
  reciclajes,
  onVerReciclajes,
}: {
  reciclajes: number
  onVerReciclajes: () => void
}) {
  const { proximo, progreso } = getResumenNivelPorReciclajes(reciclajes)

  const mensajeProgreso = proximo
    ? `Llevas ${reciclajes.toLocaleString('es-AR')} de ${proximo.min.toLocaleString('es-AR')} reciclajes para Nivel ${proximo.name}`
    : '¡Alcanzaste el nivel máximo!'

  return (
    <View style={estilos.tarjetaReciclajes}>
      <View style={estilos.filaHeaderReciclajes}>
        <View style={estilos.infoReciclajes}>
          <Text style={estilos.etiquetaReciclajes}>Reciclajes Completados</Text>
          <View style={estilos.filaValorReciclajes}>
            <Recycle size={20} color={COLORES.principal} />
            <Text style={estilos.valorReciclajes}>{reciclajes.toLocaleString('es-AR')}</Text>
          </View>
        </View>

        <BotonPrimario
          label="Movimientos"
          variante="contorno"
          icon={<Recycle size={18} color={COLORES.principal} />}
          onPress={onVerReciclajes}
          style={estilos.botonReciclajesChico}
        />
      </View>

      <View style={estilos.barraProgresoContenedor}>
        <View style={estilos.barraProgresoFondo}>
          <View style={[estilos.barraProgresoRelleno, { width: `${progreso}%` }]} />
        </View>
        <Text style={estilos.textoProgreso}>{mensajeProgreso}</Text>
      </View>
    </View>
  )
}

function AccesoInstrucciones({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={estilos.acceso}>
      <View style={estilos.accesoIzquierda}>
        <View style={estilos.accesoIcono}>
          <BookOpen size={24} color={COLORES.principal} />
        </View>
        <View>
          <Text style={estilos.accesoTitulo}>Instrucciones</Text>
          <Text style={estilos.accesoSubtitulo}>Aprendé a usar TacherV2</Text>
        </View>
      </View>
      <ChevronRight size={22} color={COLORES.principal} />
    </TouchableOpacity>
  )
}

export function PantallaHome() {
  const { userData, navigate } = useApp()
  const handleTabPress = useNavegacionPestañas()

  const puntos = Number(userData?.Puntos) || 0
  const reciclajesBruto = (userData as any)?.reciclajes ?? (userData as any)?.Reciclajes
  const reciclajes = reciclajesBruto === undefined || reciclajesBruto === null ? 0 : Math.max(0, Number(reciclajesBruto) || 0)
  const resumenNivel = getResumenNivelPorReciclajes(reciclajes)
  const nivelActual = userData?.Rango || resumenNivel.actual.name

  useSincronizarNivel(userData, resumenNivel.actual.name)

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <Saludo nombre={userData?.Nombre || 'Usuario'} />

        <TarjetaPuntosYCanje puntos={puntos} onCanjear={() => navigate('canjes')} />

        <TarjetaReciclajes reciclajes={reciclajes} onVerReciclajes={() => navigate('historial-reciclajes')} />


        <AccesoInstrucciones onPress={() => navigate('instrucciones')} />

      </ScrollView>

      <BarraDeNavegacion activeTab="home" onTabPress={handleTabPress} />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 20,
  },

  // Saludo
  saludo: {
    fontSize: 20,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  nombreUsuario: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: COLORES.texto,
  },

  // Tarjeta Puntos
  tarjetaPuntos: {
    overflow: 'hidden',
    borderRadius: 26,
    backgroundColor: COLORES.oscuro,
    padding: 24,
    gap: 18,
    ...SOMBRAS.media,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    right: -50,
    top: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORES.principal,
    opacity: 0.45,
  },
  circuloDecorativoChico: {
    position: 'absolute',
    right: 20,
    bottom: -70,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORES.principal,
    opacity: 0.25,
  },
  contenidoPuntos: {
    gap: 6,
  },
  etiquetaPuntosDisponibles: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.sobreOscuro,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  filaPuntosYCanje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  puntosGrandes: {
    flex: 1,
    fontSize: 64,
    lineHeight: 70,
    fontWeight: '800',
    letterSpacing: -2,
    color: COLORES.blanco,
  },
  subtextoPuntos: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.sobreOscuro,
  },
  // Pastilla con el ícono y el texto en fila
  botonCanjear: {
    width: 'auto',
    height: 48,
    gap: 8,
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 20,
  },
  barraProgresoContenedor: {
    gap: 8,
  },
  barraProgresoFondo: {
    width: '100%',
    height: 10,
    borderRadius: 9999,
    backgroundColor: COLORES.suave,
    overflow: 'hidden',
  },
  barraProgresoRelleno: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: COLORES.principal,
  },
  textoProgreso: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },

  // Tarjeta Reciclajes
  tarjetaReciclajes: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 18,
    gap: 16,
    ...SOMBRAS.chica,
  },
  filaHeaderReciclajes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoReciclajes: {
    gap: 4,
  },
  etiquetaReciclajes: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  filaValorReciclajes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valorReciclajes: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: COLORES.texto,
  },
  nivelYCajon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: COLORES.suave,
  },
  nombreNivelChico: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORES.principalOscuro,
  },
  // Pastilla con el ícono y el texto en fila
  botonReciclajesChico: {
    width: 'auto',
    height: 44,
    gap: 8,
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 16,
  },

  // Sección Tu camino
  seccionCamino: {
    gap: 12,
  },
  tituloCamino: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.texto,
    paddingHorizontal: 4,
  },

  // Acceso
  acceso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 16,
    ...SOMBRAS.chica,
  },
  accesoIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accesoIcono: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORES.suave,
  },
  accesoTitulo: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  accesoSubtitulo: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
})
