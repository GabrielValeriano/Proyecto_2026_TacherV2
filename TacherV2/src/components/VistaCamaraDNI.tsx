import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CameraView, type BarcodeScanningResult } from 'expo-camera'
import { X } from 'lucide-react-native'
import { COLORES, SOMBRAS } from 'src/theme'

const DELAY_TRAS_ESCANEO_MS = 400

interface Props {
  onEscaneado: (datos: string) => void
  onCancelar: () => void
  delayMs?: number
}

export function VistaCamaraDNI({ onEscaneado, onCancelar, delayMs = DELAY_TRAS_ESCANEO_MS }: Props) {
  const [escaneado, setEscaneado] = useState(false)

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

      <View style={estilos.marcoEscaneo}>
        <Text style={estilos.textoEscaneo}>Alineá el código de barras de tu DNI acá</Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onCancelar} style={estilos.botonCancelar}>
        <X size={24} color={COLORES.blanco} />
      </TouchableOpacity>
    </View>
  )
}

const estilos = StyleSheet.create({
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
    borderColor: COLORES.verde300,
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
})
