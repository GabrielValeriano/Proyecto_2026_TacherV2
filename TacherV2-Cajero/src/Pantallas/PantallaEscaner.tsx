import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { X } from 'lucide-react-native'
import { finalizarCanje, type ResultadoCanje } from 'src/services/canjes'
import { COLORES, RADIOS, SOMBRAS } from 'src/theme'

interface Props {
  onResultado: (resultado: ResultadoCanje) => void
  onCancelar: () => void
}

/** Fondo alrededor del marco: oscuro para que el texto blanco se lea sobre cualquier imagen. */
const OVERLAY = 'rgba(0,0,0,0.72)'
const GROSOR_ESQUINA = 5
const LARGO_ESQUINA = 38

export function PantallaEscaner({ onResultado, onCancelar }: Props) {
  const [permiso] = useCameraPermissions()
  const [validando, setValidando] = useState(false)
  const yaLeido = useRef(false) // evita procesar el mismo QR varias veces
  const { width } = useWindowDimensions()
  const ladoMarco = Math.min(width - 72, 280)

  // El permiso se pide desde Inicio al tocar "Escanear QR"; si por algo no está, volvemos
  useEffect(() => {
    if (permiso && !permiso.granted) onCancelar()
  }, [permiso, onCancelar])

  if (!permiso?.granted) return <View style={estilos.pantalla} />

  const handleEscaneo = async ({ data }: BarcodeScanningResult) => {
    if (yaLeido.current) return
    yaLeido.current = true
    setValidando(true)

    const resultado = await finalizarCanje(data)
    onResultado(resultado)
  }

  return (
    <View style={estilos.pantalla}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={validando ? undefined : handleEscaneo}
      />

      <View style={StyleSheet.absoluteFill}>
        {/* Arriba: la instrucción */}
        <View style={[estilos.oscuro, estilos.zonaSuperior]}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Apuntá al QR del cliente
          </Text>
          <Text style={estilos.subtitulo}>El canje se valida solo apenas se lee el código</Text>
        </View>

        {/* Medio: el marco transparente */}
        <View style={[estilos.filaMarco, { height: ladoMarco }]}>
          <View style={[estilos.oscuro, estilos.lateral]} />
          <View style={[estilos.marco, { width: ladoMarco }]}>
            <View style={[estilos.esquina, estilos.esquinaArribaIzq]} />
            <View style={[estilos.esquina, estilos.esquinaArribaDer]} />
            <View style={[estilos.esquina, estilos.esquinaAbajoIzq]} />
            <View style={[estilos.esquina, estilos.esquinaAbajoDer]} />
          </View>
          <View style={[estilos.oscuro, estilos.lateral]} />
        </View>

        {/* Abajo: cancelar */}
        <View style={[estilos.oscuro, estilos.zonaInferior]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCancelar}
            disabled={validando}
            style={estilos.botonCancelar}
            accessibilityRole="button"
            accessibilityLabel="Cancelar el escaneo"
          >
            <X size={22} strokeWidth={2.5} color={COLORES.rojo600} />
            <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {validando && (
        <View style={estilos.cubierta} accessibilityLiveRegion="polite">
          <View style={estilos.cubiertaTarjeta}>
            <ActivityIndicator size="large" color={COLORES.principal} />
            <Text style={estilos.textoValidando}>Validando canje…</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
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
    gap: 6,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    color: '#EDEDED',
  },

  // --- Marco
  filaMarco: {
    flexDirection: 'row',
  },
  lateral: {
    flex: 1,
  },
  marco: {
    borderRadius: RADIOS.grande,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  esquina: {
    position: 'absolute',
    width: LARGO_ESQUINA,
    height: LARGO_ESQUINA,
    borderColor: COLORES.acento,
  },
  esquinaArribaIzq: {
    top: -GROSOR_ESQUINA,
    left: -GROSOR_ESQUINA,
    borderTopWidth: GROSOR_ESQUINA,
    borderLeftWidth: GROSOR_ESQUINA,
    borderTopLeftRadius: RADIOS.grande,
  },
  esquinaArribaDer: {
    top: -GROSOR_ESQUINA,
    right: -GROSOR_ESQUINA,
    borderTopWidth: GROSOR_ESQUINA,
    borderRightWidth: GROSOR_ESQUINA,
    borderTopRightRadius: RADIOS.grande,
  },
  esquinaAbajoIzq: {
    bottom: -GROSOR_ESQUINA,
    left: -GROSOR_ESQUINA,
    borderBottomWidth: GROSOR_ESQUINA,
    borderLeftWidth: GROSOR_ESQUINA,
    borderBottomLeftRadius: RADIOS.grande,
  },
  esquinaAbajoDer: {
    bottom: -GROSOR_ESQUINA,
    right: -GROSOR_ESQUINA,
    borderBottomWidth: GROSOR_ESQUINA,
    borderRightWidth: GROSOR_ESQUINA,
    borderBottomRightRadius: RADIOS.grande,
  },

  // --- Abajo
  zonaInferior: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  botonCancelar: {
    minWidth: 190,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 26,
    ...SOMBRAS.grande,
  },
  botonCancelarTexto: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORES.rojo600,
  },

  // --- Validando
  cubierta: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.overlay,
  },
  cubiertaTarjeta: {
    alignItems: 'center',
    gap: 14,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 32,
    paddingVertical: 26,
    ...SOMBRAS.grande,
  },
  textoValidando: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORES.texto,
  },

})
