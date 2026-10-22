import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { BookOpen, ChevronRight, Gift, Recycle, LogOut } from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CaminoDeRangos } from 'src/components/CaminoDeRangos'
import { Encabezado } from 'src/components/Encabezado'
import { useApp } from 'src/context/AppContext'
import { getResumenRango, type ResumenRango } from 'src/domain/rangos'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { useSincronizarRango } from 'src/hooks/useSincronizarRango'
import { COLORES, SOMBRAS } from 'src/theme'

function Saludo({ nombre }: { nombre: string }) {
  return (
    <View>
      <Text style={estilos.saludo}>Hola de nuevo</Text>
      <Text style={estilos.nombreUsuario}>@{nombre}</Text>
    </View>
  )
}

interface TarjetaPuntosProps {
  puntos: number
  nombreRango: string
  resumen: ResumenRango
}

function TarjetaPuntos({ puntos, nombreRango, resumen }: TarjetaPuntosProps) {
  const { actual, proximo, progreso, puntosFaltantes } = resumen
  const IconoRango = actual.icon

  const mensajeProgreso = proximo
    ? `Te faltan ${puntosFaltantes.toLocaleString('es-AR')} puntos para llegar a ${proximo.name}`
    : '¡Alcanzaste el rango máximo!'

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.circuloDecorativoGrande} />
      <View style={estilos.circuloDecorativoChico} />

      <Text style={estilos.etiquetaPuntos}>Tus puntos</Text>
      <Text style={estilos.puntos}>{puntos.toLocaleString('es-AR')}</Text>

      <View style={estilos.chipRango}>
        <IconoRango size={16} color={COLORES.blanco} />
        <Text style={estilos.textoRango}>Rango {nombreRango}</Text>
      </View>

      <View style={estilos.barraProgreso}>
        <View style={[estilos.barraRelleno, { width: `${progreso}%` }]} />
      </View>
      <Text style={estilos.textoProgreso}>{mensajeProgreso}</Text>
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
          <Text style={estilos.accesoSubtitulo}>Aprendé a usar TeacherV2</Text>
        </View>
      </View>
      <ChevronRight size={22} color={COLORES.principal} />
    </TouchableOpacity>
  )
}

function BotonCerrarSesion({ onPress }: { onPress: () => void }) {
 return (
   <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={estilos.cerrarSesion}>
     <LogOut size={22} color={COLORES.rojo600} />
     <Text style={estilos.cerrarSesionTexto}>Cerrar sesión</Text>
   </TouchableOpacity>
 )
}

export function PantallaHome() {
  const { userData, navigate, abrirEnDesarrollo, cerrarSesion } = useApp()
  const handleTabPress = useNavegacionPestañas()

  const puntos = Number(userData?.Puntos) || 0
  const resumenRango = getResumenRango(puntos)

  useSincronizarRango(userData, resumenRango.actual.name)

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido}>
        <Saludo nombre={userData?.Nombre || 'Usuario'} />

        <TarjetaPuntos
          puntos={puntos}
          nombreRango={userData?.Rango || resumenRango.actual.name}
          resumen={resumenRango}
        />

        <View style={estilos.acciones}>
          <BotonPrimario
            label="Canjear"
            icon={<Gift size={20} color={COLORES.blanco} />}
            onPress={() => navigate('canjes')}
            style={estilos.botonAccion}
          />
          <BotonPrimario
            label="Reciclajes"
            variante="contorno"
            icon={<Recycle size={20} color={COLORES.principal} />}
            onPress={() => navigate('historial-reciclajes')}
            style={estilos.botonAccion}
          />
        </View>

        <CaminoDeRangos puntos={puntos} />

        <AccesoInstrucciones onPress={() => abrirEnDesarrollo('Instrucciones')} />
        
        <BotonCerrarSesion onPress={cerrarSesion}/>

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

  // --- Saludo
  saludo: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORES.textoSuave,
  },
  nombreUsuario: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: COLORES.texto,
  },

  // --- Tarjeta de puntos
  tarjeta: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: COLORES.oscuro,
    padding: 22,
    ...SOMBRAS.media,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: COLORES.principal,
    opacity: 0.4,
  },
  circuloDecorativoChico: {
    position: 'absolute',
    right: 28,
    bottom: -56,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORES.principal,
    opacity: 0.25,
  },
  etiquetaPuntos: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.sobreOscuro,
  },
  puntos: {
    marginTop: 2,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '700',
    letterSpacing: -1.3,
    color: COLORES.blanco,
  },
  chipRango: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  textoRango: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.blanco,
  },
  barraProgreso: {
    width: '100%',
    height: 10,
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: COLORES.acento,
  },
  textoProgreso: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.sobreOscuro,
  },

  // --- Botones Canjear / Historial
  acciones: {
    flexDirection: 'row',
    gap: 12,
  },
  botonAccion: {
    flex: 1,
    width: 'auto',
    height: 56,
  },

  // --- Acceso a Instrucciones
  acceso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 16,
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
  cerrarSesion: {
   height: 56,
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   gap: 10,
   borderRadius: 18,
   borderWidth: 1,
   borderColor: COLORES.rojo300,
   backgroundColor: COLORES.rojo50,
 },
 cerrarSesionTexto: {
   fontSize: 17,
   lineHeight: 22,
   fontWeight: '700',
   color: COLORES.rojo600,
 },

})
