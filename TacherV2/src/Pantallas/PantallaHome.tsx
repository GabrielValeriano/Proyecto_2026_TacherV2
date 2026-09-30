import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ArrowRight, Gift, Info, Leaf, Recycle } from 'lucide-react-native'
import { BarraDeNavegacion, type PestañaId } from 'src/components/BarraDeNavegacion'
import { TeacherV2Logo } from 'src/components/TeacherV2Logo'
import { useApp } from 'src/context/AppContext'
import { getResumenRango, type ResumenRango } from 'src/domain/rangos'
import { useSincronizarRango } from 'src/hooks/useSincronizarRango'
import { COLORES, SOMBRAS } from 'src/theme'

function EncabezadoBienvenida({ nombre }: { nombre: string }) {
  return (
    <View style={estilos.encabezado}>
      <View style={estilos.encabezadoTextos}>
        <Text style={estilos.saludo}>Bienvenido</Text>
        <Text style={estilos.nombreUsuario}>@{nombre}</Text>
      </View>
      <View style={estilos.marcaLogo}>
        <TeacherV2Logo size={36} />
      </View>
    </View>
  )
}

interface TarjetaPuntosProps {
  puntos: number
  nombreRango: string
  resumen: ResumenRango
  onIrACanjes: () => void
}

function TarjetaPuntos({ puntos, nombreRango, resumen, onIrACanjes }: TarjetaPuntosProps) {
  const { actual, proximo, progreso, puntosFaltantes } = resumen
  const IconoRango = actual.icon

  const mensajeProgreso = proximo
    ? `Te faltan ${puntosFaltantes.toLocaleString('es-AR')} puntos para llegar a ${proximo.name}`
    : '¡Alcanzaste el rango máximo!'

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.iconoDecorativo}>
        <Recycle size={176} color={COLORES.blanco} opacity={0.30} />
      </View>

      <View style={estilos.tarjetaContenido}>
        <View>
          <Text style={estilos.etiquetaPuntos}>Tus puntos</Text>
          <Text style={estilos.puntos}>{puntos.toLocaleString('es-AR')}</Text>

          <View style={estilos.chipRango}>
            <IconoRango size={14} color={COLORES.blanco} />
            <Text style={estilos.textoRango}>Rango {nombreRango}</Text>
          </View>
        </View>

        <View style={estilos.bloqueProgreso}>
          <View style={estilos.barraProgreso}>
            <View style={[estilos.barraRelleno, { width: `${progreso}%` }]} />
          </View>
          <Text style={estilos.textoProgreso}>{mensajeProgreso}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={onIrACanjes} style={estilos.botonCanjes}>
          <Gift size={18} color={COLORES.verde} />
          <Text style={estilos.textoBotonCanjes}>Ir a canjes</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function AccesoHistorial({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={estilos.acceso}>
      <View style={estilos.accesoIzquierda}>
        <View style={estilos.accesoIcono}>
          <Leaf size={20} color={COLORES.verde} />
        </View>
        <View>
          <Text style={estilos.accesoTitulo}>Historial de reciclajes</Text>
          <Text style={estilos.accesoSubtitulo}>Ver tu actividad</Text>
        </View>
      </View>
      <ArrowRight size={16} color={COLORES.verde} />
    </TouchableOpacity>
  )
}

function InfoTeacherV2({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  return (
    <View style={estilos.info}>
      <View style={estilos.infoEncabezado}>
        <Info size={16} color={COLORES.verde} />
        <Text style={estilos.infoTitulo}>¿Por qué TeacherV2?</Text>
      </View>
      <Text style={estilos.infoTexto}>
        Convertimos el reciclaje en recompensas reales para que cada botella, lata o papel que
        reciclás tenga un impacto positivo en tu escuela y en el planeta.
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onCerrarSesion}
        style={estilos.botonCerrarSesion}
      >
        <Text style={estilos.textoCerrarSesion}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

export function PantallaHome() {
  const { userData, cerrarSesion, navigate, abrirEnDesarrollo } = useApp()
  const puntos = Number(userData?.Puntos) || 0
  const resumenRango = getResumenRango(puntos)

  useSincronizarRango(userData, resumenRango.actual.name)

  const handleTabPress = (id: PestañaId, label: string) => {
    if (id === 'home') return navigate('home')
    if (id === 'canjes') return navigate('recibo-canje')
    abrirEnDesarrollo(label)
  }

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <EncabezadoBienvenida nombre={userData?.Nombre || 'Usuario'} />
        <TarjetaPuntos
          puntos={puntos}
          nombreRango={userData?.Rango || resumenRango.actual.name}
          resumen={resumenRango}
          onIrACanjes={() => navigate('recibo-canje')}
        />
        <AccesoHistorial onPress={() => abrirEnDesarrollo('Historial de Reciclajes')} />
        <InfoTeacherV2 onCerrarSesion={cerrarSesion} />
      </ScrollView>

      <BarraDeNavegacion activeTab="home" onTabPress={handleTabPress} />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: 'rgba(240,253,244,0.3)',
  },
  contenido: {
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 24,
  },

  // --- Encabezado de bienvenida
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  encabezadoTextos: {
    gap: 2,
  },
  saludo: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORES.verde700,
  },
  nombreUsuario: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.gris900,
  },
  marcaLogo: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
    padding: 8,
  },

  // --- Tarjeta de puntos
  tarjeta: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: COLORES.verde600,
    padding: 24,
    ...SOMBRAS.grande,
  },
  iconoDecorativo: {
    position: 'absolute',
    right: -24,
    top: -24,
  },
  tarjetaContenido: {
    zIndex: 10,
    justifyContent: 'space-between',
  },
  etiquetaPuntos: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORES.verde100,
  },
  puntos: {
    marginTop: 4,
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: COLORES.blanco,
  },
  chipRango: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textoRango: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.blanco,
  },
  bloqueProgreso: {
    marginTop: 24,
    gap: 8,
  },
  barraProgreso: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: COLORES.amarillo400,
  },
  textoProgreso: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORES.verde100,
  },
  botonCanjes: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: COLORES.blanco,
    ...SOMBRAS.chica,
  },
  textoBotonCanjes: {
    fontWeight: '600',
    color: COLORES.verde600,
  },

  // --- Acceso al historial
  acceso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.verde200,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORES.verde100,
  },
  accesoTitulo: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORES.gris900,
  },
  accesoSubtitulo: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORES.gris500,
  },

  // --- Bloque "¿Por qué TeacherV2?"
  info: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: 'rgba(220,252,231,0.5)',
    padding: 20,
  },
  infoEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitulo: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.35,
    color: COLORES.verde800,
  },
  infoTexto: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 19.5,
    color: COLORES.gris600,
  },
  botonCerrarSesion: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.verde300,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textoCerrarSesion: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.verde700,
  },
})
