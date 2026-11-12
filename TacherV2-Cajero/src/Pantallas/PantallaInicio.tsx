import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useCameraPermissions } from 'expo-camera'
import { BookOpen, ChevronRight, QrCode } from 'lucide-react-native'
import { Banner } from 'src/components/Banner'
import { CirculoMarca } from 'src/components/CirculoMarca'
import { MarcaTacherV2, TacherV2Logo } from 'src/components/TacherV2Logo'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props {
  onInstrucciones: () => void
  onEscanear: () => void
}

function AccesoInstrucciones({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={estilos.acceso}
      accessibilityRole="button"
      accessibilityLabel="Instrucciones: cómo usar TacherV2 como cajero"
    >
      <View style={estilos.accesoIzquierda}>
        <View style={estilos.accesoIcono}>
          <BookOpen size={24} color={COLORES.principal} />
        </View>
        <View style={estilos.accesoTextos}>
          <Text style={estilos.accesoTitulo}>Instrucciones</Text>
          <Text style={estilos.accesoSubtitulo}>Cómo usar TacherV2 como cajero</Text>
        </View>
      </View>
      <ChevronRight size={22} color={COLORES.principal} />
    </TouchableOpacity>
  )
}

const TAMANIO_BOTON = 176
const RADIO_BOTON = RADIOS.tarjeta

/** La acción principal del cajero: un cuadrado grande y centrado con el degradé de la marca. */
function BotonEscanear({ onPress, cargando }: { onPress: () => void; cargando: boolean }) {
  const [presionado, setPresionado] = useState(false)
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={() => setPresionado(true)}
      onPressOut={() => setPresionado(false)}
      disabled={cargando}
      accessibilityRole="button"
      accessibilityLabel="Escanear QR del cliente"
      accessibilityState={{ busy: cargando }}
      style={[estilos.botonEscanear, presionado && estilos.botonEscanearPresionado]}
    >
      <View style={estilos.botonEscanearAnillo}>
        <CirculoMarca size={TAMANIO_BOTON} radio={RADIO_BOTON}>
          {cargando ? (
            <ActivityIndicator size="large" color={COLORES.blanco} />
          ) : (
            <QrCode size={72} strokeWidth={1.75} color={COLORES.blanco} />
          )}
        </CirculoMarca>
      </View>
      <Text style={estilos.botonEscanearTexto}>Escanear QR</Text>
      <Text style={estilos.botonEscanearAyuda}>Tocá para abrir la cámara</Text>
    </TouchableOpacity>
  )
}

export function PantallaInicio({ onInstrucciones, onEscanear }: Props) {
  const [permiso, pedirPermiso] = useCameraPermissions()
  const [pidiendo, setPidiendo] = useState(false)

  // Sin pantalla intermedia: el permiso del sistema aparece al tocar el botón,
  // y si lo acepta se abre directo la cámara
  const handleEscanear = async () => {
    if (permiso?.granted) return onEscanear()

    setPidiendo(true)
    const respuesta = await pedirPermiso()
    setPidiendo(false)
    if (respuesta.granted) return onEscanear()

    if (respuesta.canAskAgain) {
      Alert.alert('Permiso requerido', 'Necesitamos la cámara para leer el QR del cliente.')
    } else {
      // Lo rechazó con "no volver a preguntar": solo se puede activar desde los ajustes
      Alert.alert(
        'Cámara desactivada',
        'Activá el permiso de cámara para TacherV2 en los ajustes del teléfono.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ],
      )
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Banner />

      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <View style={estilos.hero}>
          <TacherV2Logo size={112} halo />
          <View style={estilos.heroTextos}>
            <Text style={estilos.saludo}>¡Bienvenido, cajero!</Text>
            <View accessibilityRole="header">
              <MarcaTacherV2 tamanio={40} />
            </View>
            <Text style={estilos.descripcion}>
              Validá los QR de canje, descontá los puntos y entregá los premios al instante.
            </Text>
          </View>
        </View>

        {/* Instrucciones y, justo debajo y centrado, el botón de escanear */}
        <View style={estilos.acciones}>
          <AccesoInstrucciones onPress={onInstrucciones} />
          <BotonEscanear onPress={handleEscanear} cargando={pidiendo} />
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // --- Marca
  hero: {
    alignItems: 'center',
    gap: 24,
  },
  heroTextos: {
    alignItems: 'center',
    gap: 8,
  },
  saludo: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLORES.principal,
  },
  descripcion: {
    maxWidth: 320,
    marginTop: 4,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    color: COLORES.textoSuave,
  },

  acciones: {
    gap: 24,
  },

  // --- Acceso a las instrucciones
  acceso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    padding: 16,
    ...SOMBRAS.media,
  },
  accesoIzquierda: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accesoIcono: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.medio,
    backgroundColor: COLORES.suave,
  },
  accesoTextos: {
    flex: 1,
  },
  accesoTitulo: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  accesoSubtitulo: {
    fontSize: 14,
    lineHeight: 19,
    color: COLORES.textoSuave,
  },

  // --- Botón de escanear: grande y centrado debajo de las instrucciones
  botonEscanear: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  botonEscanearPresionado: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  botonEscanearAnillo: {
    marginBottom: 8,
    borderRadius: RADIO_BOTON + 10,
    borderWidth: 10,
    borderColor: 'rgba(38,130,87,0.10)',
  },
  botonEscanearTexto: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORES.texto,
  },
  botonEscanearAyuda: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 19,
    color: COLORES.textoSuave,
  },
})
