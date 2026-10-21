import React from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import { Encabezado } from 'src/components/Encabezado'
import { useApp } from 'src/context/AppContext'
import { getResumenRango } from 'src/domain/rangos'
import { useNavegacionPestañas } from 'src/hooks/useNavegacionPestañas'
import { COLORES, SOMBRAS } from 'src/theme'

/** El rango se guarda sin tilde ("Arbol"); acá se muestra bien escrito. */
const nombreDeRango = (nombre: string) => (nombre === 'Arbol' ? 'Árbol' : nombre)

// ---------------------------------------------------------------------------
// Cabecera: ícono, nombre, rango y puntos
// ---------------------------------------------------------------------------

interface CabeceraProps {
  nombre: string
  nombreRango: string
  IconoRango: LucideIcon
  puntos: number
}

function Cabecera({ nombre, nombreRango, IconoRango, puntos }: CabeceraProps) {
  return (
    <View style={estilos.cabecera}>
      <View style={estilos.avatar}>
        <User size={52} color={COLORES.blanco} />
      </View>

      <Text style={estilos.nombre} numberOfLines={1}>
        @{nombre}
      </Text>

      <View style={estilos.resumen}>
        <View style={estilos.dato}>
          <Text style={estilos.datoEtiqueta}>Rango</Text>
          <View style={estilos.datoValor}>
            <IconoRango size={20} color={COLORES.principal} />
            <Text style={estilos.datoTexto}>{nombreRango}</Text>
          </View>
        </View>

        <View style={estilos.separador} />

        <View style={estilos.dato}>
          <Text style={estilos.datoEtiqueta}>Puntos actuales</Text>
          <View style={estilos.datoValor}>
            <Coins size={20} color={COLORES.acento} />
            <Text style={estilos.datoTexto}>{puntos.toLocaleString('es-AR')}</Text>
          </View>
        </View>
      </View>
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
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={estilos.cerrarSesion}>
      <LogOut size={22} color={COLORES.rojo600} />
      <Text style={estilos.cerrarSesionTexto}>Cerrar sesión</Text>
    </TouchableOpacity>
  )
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

export function PantallaPerfil() {
  const { userData, abrirEnDesarrollo, cerrarSesion } = useApp()
  const handleTabPress = useNavegacionPestañas()

  const puntos = Number(userData?.Puntos) || 0
  const resumenRango = getResumenRango(puntos)
  const nombreRango = nombreDeRango(userData?.Rango || resumenRango.actual.name)

  // Se pide confirmación para no cerrar la sesión por error
  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ])
  }

  return (
    <View style={estilos.pantalla}>
      <Encabezado />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <Cabecera
          nombre={userData?.Nombre || 'Usuario'}
          nombreRango={nombreRango}
          IconoRango={resumenRango.actual.icon}
          puntos={puntos}
        />

        <View style={estilos.lista}>
          <Opcion
            icono={FileText}
            titulo="Datos y condiciones"
            subtitulo="Términos de uso y privacidad"
            conDivisor
            onPress={() => abrirEnDesarrollo('Datos y condiciones')}
          />
          <Opcion
            icono={IdCard}
            titulo="Cambiar DNI"
            subtitulo="Actualizá tu documento"
            conDivisor
            onPress={() => abrirEnDesarrollo('Cambiar DNI')}
          />
          <Opcion
            icono={Settings}
            titulo="Ajustes"
            subtitulo="Preferencias de la app"
            conDivisor={false}
            onPress={() => abrirEnDesarrollo('Ajustes')}
          />
        </View>

        <BotonCerrarSesion onPress={handleCerrarSesion} />
      </ScrollView>

      <BarraDeNavegacion activeTab="perfil" onTabPress={handleTabPress} />
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

  // --- Cabecera
  cabecera: {
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 54,
    borderWidth: 4,
    borderColor: COLORES.acento,
    backgroundColor: COLORES.oscuro,
    ...SOMBRAS.media,
  },
  nombre: {
    maxWidth: '100%',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: COLORES.texto,
  },
  resumen: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginTop: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    paddingVertical: 16,
    ...SOMBRAS.chica,
  },
  dato: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  datoEtiqueta: {
    fontSize: 14,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  datoValor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datoTexto: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORES.texto,
  },
  separador: {
    width: 1,
    marginVertical: 4,
    backgroundColor: COLORES.linea,
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
