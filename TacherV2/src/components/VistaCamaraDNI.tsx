import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { CameraView, type BarcodeScanningResult } from 'expo-camera'
import { CheckCircle2, Hand, Sun, X, ZoomIn, type LucideIcon } from 'lucide-react-native'
import { COLORES, SOMBRAS } from 'src/theme'

const DELAY_TRAS_ESCANEO_MS = 400

/** Fondo alrededor del marco: bien oscuro para que el texto blanco se lea sobre cualquier imagen. */
const OVERLAY = 'rgba(0,0,0,0.78)'
/** Verde lima de la paleta: sobre el negro tiene muchísimo contraste. */
const RESALTE = COLORES.acento

const CONSEJOS: { icon: LucideIcon; text: string }[] = [
  { icon: Sun, text: 'Buscá buena luz, sin reflejos' },
  { icon: Hand, text: 'Mantené el celular quieto' },
  { icon: ZoomIn, text: 'Acercalo hasta que se vea nítido' },
]

interface Props {
  onEscaneado: (datos: string) => void
  onCancelar: () => void
  delayMs?: number
}

export function VistaCamaraDNI({ onEscaneado, onCancelar, delayMs = DELAY_TRAS_ESCANEO_MS }: Props) {
  const [escaneado, setEscaneado] = useState(false)
  const { width } = useWindowDimensions()
  const anchoMarco = Math.min(width - 48, 360)
  const altoMarco = Math.round(anchoMarco * 0.62)

  const handleEscaneo = ({ data }: BarcodeScanningResult) => {
    if (escaneado) return
    setEscaneado(true)
    setTimeout(() => {
      onEscaneado(data)
    }, delayMs)
  }

  return (
    <View style={estilos.camaraPantalla}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['pdf417', 'code128', 'qr'] }}
        onBarcodeScanned={escaneado ? undefined : handleEscaneo}
      />

      <View style={StyleSheet.absoluteFill}>
        {/* Arriba: la instrucción principal */}
        <View style={[estilos.oscuro, estilos.zonaSuperior]}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Posicioná el DNI dentro del marco
          </Text>
          <Text style={estilos.subtitulo}>Apuntá al código de barras de tu documento</Text>
        </View>

        {/* Medio: el marco transparente, con oscuro a los costados */}
        <View style={[estilos.filaMarco, { height: altoMarco }]}>
          <View style={[estilos.oscuro, estilos.lateral]} />
          <View
            style={[estilos.marco, { width: anchoMarco }, escaneado && estilos.marcoListo]}
            accessible
            accessibilityLabel="Marco para el código de barras del DNI"
          >
            <View style={[estilos.esquina, estilos.esquinaArribaIzq]} />
            <View style={[estilos.esquina, estilos.esquinaArribaDer]} />
            <View style={[estilos.esquina, estilos.esquinaAbajoIzq]} />
            <View style={[estilos.esquina, estilos.esquinaAbajoDer]} />

            {escaneado && (
              <View style={estilos.listo} accessibilityLiveRegion="polite">
                <CheckCircle2 size={26} color={COLORES.oscuro} />
                <Text style={estilos.listoTexto}>DNI leído</Text>
              </View>
            )}
          </View>
          <View style={[estilos.oscuro, estilos.lateral]} />
        </View>

        {/* Abajo: consejos y cancelar */}
        <View style={[estilos.oscuro, estilos.zonaInferior]}>
          <View style={estilos.consejos}>
            {CONSEJOS.map(({ icon: Icono, text }) => (
              <View key={text} style={estilos.consejo}>
                <Icono size={26} color={RESALTE} />
                <Text style={estilos.consejoTexto}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCancelar}
            style={estilos.botonCancelar}
            accessibilityRole="button"
            accessibilityLabel="Cancelar el escaneo"
          >
            <X size={24} color={COLORES.rojo600} strokeWidth={2.5} />
            <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const GROSOR_ESQUINA = 5
const LARGO_ESQUINA = 36

const estilos = StyleSheet.create({
  camaraPantalla: {
    flex: 1,
    backgroundColor: '#000',
  },
  oscuro: {
    backgroundColor: OVERLAY,
  },

  // --- Arriba
  zonaSuperior: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '500',
    color: '#F2F2F2',
  },

  // --- Marco
  filaMarco: {
    flexDirection: 'row',
  },
  lateral: {
    flex: 1,
  },
  marco: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  marcoListo: {
    borderColor: RESALTE,
    borderWidth: 3,
  },
  esquina: {
    position: 'absolute',
    width: LARGO_ESQUINA,
    height: LARGO_ESQUINA,
    borderColor: RESALTE,
  },
  esquinaArribaIzq: {
    top: -GROSOR_ESQUINA,
    left: -GROSOR_ESQUINA,
    borderTopWidth: GROSOR_ESQUINA,
    borderLeftWidth: GROSOR_ESQUINA,
    borderTopLeftRadius: 20,
  },
  esquinaArribaDer: {
    top: -GROSOR_ESQUINA,
    right: -GROSOR_ESQUINA,
    borderTopWidth: GROSOR_ESQUINA,
    borderRightWidth: GROSOR_ESQUINA,
    borderTopRightRadius: 20,
  },
  esquinaAbajoIzq: {
    bottom: -GROSOR_ESQUINA,
    left: -GROSOR_ESQUINA,
    borderBottomWidth: GROSOR_ESQUINA,
    borderLeftWidth: GROSOR_ESQUINA,
    borderBottomLeftRadius: 20,
  },
  esquinaAbajoDer: {
    bottom: -GROSOR_ESQUINA,
    right: -GROSOR_ESQUINA,
    borderBottomWidth: GROSOR_ESQUINA,
    borderRightWidth: GROSOR_ESQUINA,
    borderBottomRightRadius: 20,
  },
  listo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    backgroundColor: RESALTE,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  listoTexto: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: COLORES.oscuro,
  },

  // --- Abajo
  zonaInferior: {
    flex: 1.2,
    justifyContent: 'space-between',
    gap: 20,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 36,
  },
  consejos: {
    gap: 14,
  },
  consejo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  consejoTexto: {
    flex: 1,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
    color: COLORES.blanco,
  },
  botonCancelar: {
    alignSelf: 'center',
    minWidth: 200,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 9999,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 28,
    ...SOMBRAS.grande,
  },
  botonCancelarTexto: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: COLORES.rojo600,
  },
})
