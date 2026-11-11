import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  ChevronRight,
  Coins,
  FileText,
  IdCard,
  LogOut,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react-native'
import { BarraDeNavegacion } from 'src/components/BarraDeNavegacion'
import { AvatarInicial } from 'src/components/CirculoMarca'
import { Encabezado } from 'src/components/Encabezado'
import { MensajeExito } from 'src/components/MensajeExito'
import { ModalCerrarSesion } from 'src/components/ModalCerrarSesion'
import { useApp } from 'src/context/AppContext'
import { getResumenRangoPorReciclajes } from 'src/domain/rangos'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { COLORES, SOMBRAS } from 'src/theme'
import { inicialesDe } from 'src/utils/iniciales'


/** El rango se guarda sin tilde ("Arbol"); acá se muestra bien escrito. */
const nombreDeRango = (nombre: string) => (nombre === 'Arbol' ? 'Árbol' : nombre)

const formatear = (numero: number) => numero.toLocaleString('es-AR')


// ---------------------------------------------------------------------------
// Avatar: círculo con degradé verde y las iniciales
// ---------------------------------------------------------------------------


const TAMANIO_AVATAR = 96

function Avatar({ nombre }: { nombre: string }) {
  return (
    <View style={estilos.avatarAnillo}>
      <AvatarInicial
        texto={inicialesDe(nombre)}
        size={TAMANIO_AVATAR}
        alternativa={<User size={42} color={COLORES.blanco} />}
      />
    </View>
  )
}


// ---------------------------------------------------------------------------
// Tarjetas de resumen: el rango (sale de los reciclajes) y los puntos (para canjear)
// van separados para que no se confunda una cosa con la otra.
// ---------------------------------------------------------------------------


interface TarjetaRangoProps {
  nombreRango: string
  IconoRango: LucideIcon
  reciclajes: number
}

/** Rango y reciclajes: clara. */
function TarjetaRango({ nombreRango, IconoRango, reciclajes }: TarjetaRangoProps) {
  return (
    <View style={[estilos.tarjeta, estilos.tarjetaClara]}>
      <View style={estilos.tarjetaFila}>
        <View style={[estilos.tarjetaIcono, estilos.iconoSobreClaro]}>
          <IconoRango size={22} color={COLORES.verde700} />
        </View>
        <View style={estilos.tarjetaDatos}>
          <Text style={estilos.etiqueta}>Rango</Text>
          <Text style={estilos.valorClaro} numberOfLines={1} adjustsFontSizeToFit>
            {nombreRango}
          </Text>
          <Text style={estilos.detalleClaro} numberOfLines={1} adjustsFontSizeToFit>
            {formatear(reciclajes)} {reciclajes === 1 ? 'reciclaje' : 'reciclajes'}
          </Text>
        </View>
      </View>
      <Text style={estilos.subtituloClaro}>Tus beneficios son de nivel {nombreRango}</Text>
    </View>
  )
}

/** Puntos para canjear: oscura. */
function TarjetaPuntos({ puntos }: { puntos: number }) {
  return (
    <View style={[estilos.tarjeta, estilos.tarjetaOscura]}>
      <View style={estilos.circuloDecorativo} />
      <View style={estilos.tarjetaFila}>
        <View style={[estilos.tarjetaIcono, estilos.iconoSobreOscuro]}>
          <Coins size={22} color={COLORES.oscuro} />
        </View>
        <View style={estilos.tarjetaDatos}>
          <Text style={[estilos.etiqueta, estilos.etiquetaSobreOscuro]}>Puntos</Text>
          <Text style={estilos.valorOscuro} numberOfLines={1} adjustsFontSizeToFit>
            {formatear(puntos)}
          </Text>
        </View>
      </View>
      <Text style={estilos.subtituloOscuro}>Disponibles para canjear</Text>
    </View>
  )
}


// ---------------------------------------------------------------------------
// Opciones del perfil
// ---------------------------------------------------------------------------


interface OpcionProps {
 icono: LucideIcon
 titulo: string
 subtitulo: string
 conDivisor: boolean
 onPress: () => void
}


function Opcion({ icono: Icono, titulo, subtitulo, conDivisor, onPress }: OpcionProps) {
 return (
   <TouchableOpacity
     activeOpacity={0.7}
     onPress={onPress}
     style={[estilos.opcion, conDivisor && estilos.opcionConDivisor]}
   >
     <View style={estilos.opcionIcono}>
       <Icono size={24} color={COLORES.principal} />
     </View>


     <View style={estilos.opcionTextos}>
       <Text style={estilos.opcionTitulo}>{titulo}</Text>
       <Text style={estilos.opcionSubtitulo}>{subtitulo}</Text>
     </View>


     <ChevronRight size={22} color={COLORES.gris400} />
   </TouchableOpacity>
 )
}


function BotonCerrarSesion({ onPress }: { onPress: () => void }) {
 return (
   <TouchableOpacity
     activeOpacity={0.85}
     onPress={onPress}
     style={estilos.cerrarSesion}
     accessibilityRole="button"
   >
     <LogOut size={22} color={COLORES.blanco} />
     <Text style={estilos.cerrarSesionTexto}>Cerrar sesión</Text>
   </TouchableOpacity>
 )
}


// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------


export function PantallaPerfil() {
  const { userData, navigate, cerrarSesion } = useApp()
  const handleTabPress = useNavegacionPestañas()
  const [modalCerrarSesionVisible, setModalCerrarSesionVisible] = useState(false)
  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  const puntos = Number(userData?.Puntos) || 0
  // El rango sale de los reciclajes, igual que en el Home
  const reciclajes = Math.max(0, Number(userData?.reciclajes) || 0)
  const resumenRango = getResumenRangoPorReciclajes(reciclajes)
  const nombreRango = nombreDeRango(resumenRango.actual.name)
  const nombre = userData?.Nombre || 'Usuario'

  const handleAbrirCerrarSesion = () => {
    setModalCerrarSesionVisible(true)
  }

  const handleCancelarCerrarSesion = () => {
    if (cerrandoSesion) return
    setModalCerrarSesionVisible(false)
  }

  const handleConfirmarCerrarSesion = () => {
    setCerrandoSesion(true)
    try {
      cerrarSesion()
    } finally {
      setModalCerrarSesionVisible(false)
      setCerrandoSesion(false)
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <View style={estilos.cabecera}>
          <Avatar nombre={nombre} />
          <Text style={estilos.nombre} numberOfLines={1}>
            @{nombre}
          </Text>
        </View>

        <View style={estilos.resumen}>
          <TarjetaRango
            nombreRango={nombreRango}
            IconoRango={resumenRango.actual.icon}
            reciclajes={reciclajes}
          />
          <TarjetaPuntos puntos={puntos} />
        </View>

        <View style={estilos.lista}>
          <Opcion
            icono={FileText}
            titulo="Datos y condiciones"
            subtitulo="Términos de uso y privacidad"
            conDivisor
            onPress={() => navigate('datos-condiciones')}
          />
          <Opcion
            icono={IdCard}
            titulo="Cambiar DNI"
            subtitulo="Actualizá tu documento"
            conDivisor
            onPress={() => navigate('cambiar-dni')}
          />
          <Opcion
            icono={Settings}
            titulo="Ajustes"
            subtitulo="Preferencias de la app"
            conDivisor={false}
            onPress={() => navigate('ajustes')}
          />
        </View>

        <BotonCerrarSesion onPress={handleAbrirCerrarSesion} />
      </ScrollView>

      <MensajeExito />
      <BarraDeNavegacion activeTab="perfil" onTabPress={handleTabPress} />
      <ModalCerrarSesion
        visible={modalCerrarSesionVisible}
        onCancelar={handleCancelarCerrarSesion}
        onConfirmar={handleConfirmarCerrarSesion}
        cargando={cerrandoSesion}
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
   gap: 24,
   paddingHorizontal: 20,
   paddingTop: 28,
   paddingBottom: 16,
 },


 // --- Cabecera: avatar y nombre
 cabecera: {
   alignItems: 'center',
   gap: 12,
 },
 avatarAnillo: {
   borderRadius: TAMANIO_AVATAR / 2 + 4,
   borderWidth: 4,
   borderColor: COLORES.blanco,
   backgroundColor: COLORES.blanco,
 },
 nombre: {
   maxWidth: '100%',
   fontSize: 24,
   lineHeight: 30,
   fontWeight: '700',
   letterSpacing: -0.5,
   color: COLORES.texto,
 },


 // --- Tarjetas de resumen: siempre lado a lado, mitad y mitad
 resumen: {
   flexDirection: 'row',
   alignItems: 'stretch',
   gap: 12,
 },
 tarjeta: {
   flex: 1,
   minWidth: 0,
   gap: 12,
   overflow: 'hidden',
   borderRadius: 26,
   paddingVertical: 16,
   paddingHorizontal: 14,
   // Sombra suave y difusa
   shadowColor: COLORES.oscuro,
   shadowOffset: { width: 0, height: 8 },
   shadowOpacity: 0.12,
   shadowRadius: 18,
   elevation: 5,
 },
 tarjetaClara: {
   borderWidth: 1,
   borderColor: COLORES.linea,
   backgroundColor: COLORES.blanco,
 },
 tarjetaOscura: {
   backgroundColor: COLORES.oscuro,
 },
 circuloDecorativo: {
   position: 'absolute',
   top: -50,
   right: -45,
   width: 120,
   height: 120,
   borderRadius: 60,
   backgroundColor: 'rgba(255,255,255,0.06)',
 },
 tarjetaFila: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 10,
 },
 tarjetaIcono: {
   width: 42,
   height: 42,
   alignItems: 'center',
   justifyContent: 'center',
   borderRadius: 14,
 },
 iconoSobreClaro: {
   backgroundColor: COLORES.suave,
 },
 iconoSobreOscuro: {
   backgroundColor: COLORES.acento,
 },
 tarjetaDatos: {
   flex: 1,
 },
 etiqueta: {
   fontSize: 11,
   lineHeight: 15,
   fontWeight: '700',
   letterSpacing: 0.6,
   textTransform: 'uppercase',
   color: COLORES.textoSuave,
 },
 etiquetaSobreOscuro: {
   color: COLORES.sobreOscuro,
 },
 valorClaro: {
   fontSize: 20,
   lineHeight: 25,
   fontWeight: '800',
   letterSpacing: -0.5,
   color: COLORES.texto,
 },
 detalleClaro: {
   fontSize: 13,
   lineHeight: 17,
   fontWeight: '600',
   color: COLORES.verde700,
 },
 valorOscuro: {
   fontSize: 28,
   lineHeight: 34,
   fontWeight: '800',
   letterSpacing: -1,
   color: COLORES.blanco,
 },
 subtituloClaro: {
   marginTop: 'auto',
   borderTopWidth: 1,
   borderTopColor: COLORES.linea,
   paddingTop: 10,
   fontSize: 12,
   lineHeight: 16,
   color: COLORES.textoSuave,
 },
 subtituloOscuro: {
   marginTop: 'auto',
   borderTopWidth: 1,
   borderTopColor: 'rgba(255,255,255,0.12)',
   paddingTop: 10,
   fontSize: 12,
   lineHeight: 16,
   color: COLORES.sobreOscuro,
 },


 // --- Opciones
 lista: {
   borderRadius: 24,
   borderWidth: 1,
   borderColor: COLORES.linea,
   backgroundColor: COLORES.blanco,
   ...SOMBRAS.chica,
 },
 opcion: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 14,
   padding: 16,
 },
 opcionConDivisor: {
   borderBottomWidth: 1,
   borderBottomColor: COLORES.linea,
 },
 opcionIcono: {
   width: 48,
   height: 48,
   alignItems: 'center',
   justifyContent: 'center',
   borderRadius: 14,
   backgroundColor: COLORES.suave,
 },
 opcionTextos: {
   flex: 1,
 },
 opcionTitulo: {
   fontSize: 17,
   lineHeight: 22,
   fontWeight: '600',
   color: COLORES.texto,
 },
 opcionSubtitulo: {
   fontSize: 14,
   lineHeight: 18,
   color: COLORES.textoSuave,
 },


 // --- Cerrar sesión
 cerrarSesion: {
   height: 56,
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   gap: 10,
   borderRadius: 18,
   backgroundColor: COLORES.rojo600,
   shadowColor: COLORES.rojo600,
   shadowOffset: { width: 0, height: 6 },
   shadowOpacity: 0.25,
   shadowRadius: 10,
   elevation: 4,
 },
 cerrarSesionTexto: {
   fontSize: 17,
   lineHeight: 22,
   fontWeight: '700',
   color: COLORES.blanco,
 },
})

