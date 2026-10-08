import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { IdCard, ScanLine, ShieldCheck, X } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { COLORES, SOMBRAS } from 'src/theme'

const DELAY_TRAS_ESCANEO_MS = 400

const AVISOS = [
  { icon: ScanLine, text: 'Escaneamos únicamente el código de barras del DNI.' },
  { icon: ShieldCheck, text: 'Tus datos se usan solo para identificarte al reciclar.' },
]

function VistaCamara({
  onEscaneado,
  onCancelar,
}: {
  onEscaneado: (datos: string) => void
  onCancelar: () => void
}) {
  const [escaneado, setEscaneado] = useState(false)

  const handleEscaneo = ({ data }: BarcodeScanningResult) => {
    if (escaneado) return
    setEscaneado(true)
    onEscaneado(data)
  }

  return (
    <View style={estilos.camaraPantalla}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['pdf417', 'code128', 'qr'] }}
        onBarcodeScanned={escaneado ? undefined : handleEscaneo}
      />

      <View style={estilos.marcoEscaneo}>
        <Text style={estilos.textoEscaneo}>Alineá el código de barras de tu DNI acá</Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onCancelar} style={estilos.botonCancelar}>
        <X size={24} color={COLORES.blanco} />
      </TouchableOpacity>
    </View>
  )
}

export function PantallaEscanearDNI() {
  const { navigate, actualizarFlowData } = useApp()
  const [permission, requestPermission] = useCameraPermissions()
  const [escaneando, setEscaneando] = useState(false)

  const handleIniciarEscaneo = async () => {
    if (!permission?.granted) {
      const respuesta = await requestPermission()
      if (!respuesta.granted) {
        return Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para poder escanear el código de barras de tu DNI.',
        )
      }
    }
    setEscaneando(true)
  }

  const handleEscaneado = (dni: string) => {
    actualizarFlowData({ dni })
    setTimeout(() => {
      setEscaneando(false)
      navigate('register-username')
    }, DELAY_TRAS_ESCANEO_MS)
  }

  if (escaneando) {
    return <VistaCamara onEscaneado={handleEscaneado} onCancelar={() => setEscaneando(false)} />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Verificá tu identidad" onBack={() => navigate('register-email')} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View>
          <View style={estilos.iconoPrincipal}>
            <IdCard size={40} strokeWidth={1.75} color={COLORES.verde} />
          </View>

          <Text style={estilos.titulo}>Vamos a escanear tu documento</Text>
          <Text style={estilos.descripcion}>
            Necesitamos leer el código de barras de tu DNI para vincular tus reciclajes a tu
            cuenta. Así sabemos a quién sumarle los puntos en la caja.
          </Text>

          <View style={estilos.avisos}>
            {AVISOS.map(({ icon: Icono, text }) => (
              <View key={text} style={estilos.aviso}>
                <View style={estilos.avisoIcono}>
                  <Icono size={20} color={COLORES.verde} />
                </View>
                <Text style={estilos.avisoTexto}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <BotonPrimario
          label="Escanear documento"
          onPress={handleIniciarEscaneo}
          icon={<ScanLine size={20} color={COLORES.blanco} />}
          style={estilos.botonEscanear}
        />
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  // La cámara
  camaraPantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  marcoEscaneo: {
    width: 320,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
  },
  textoEscaneo: {
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: COLORES.blanco,
  },
  botonCancelar: {
    position: 'absolute',
    bottom: 48,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: 'rgba(220,38,38,0.9)',
    ...SOMBRAS.grande,
  },

  // Pantalla de confirmacion
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  iconoPrincipal: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.verde100,
    ...SOMBRAS.chica,
  },
  titulo: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.gris900,
  },
  descripcion: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  avisos: {
    marginTop: 32,
    gap: 12,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.verde100,
    backgroundColor: 'rgba(240,253,244,0.5)',
    padding: 16,
    ...SOMBRAS.chica,
  },
  avisoIcono: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORES.verde100,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16.5,
    color: COLORES.gris600,
  },
  botonEscanear: {
    marginTop: 32,
  },
})
