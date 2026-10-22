import React, { useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { Camera, X } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { finalizarCanje, type ResultadoCanje } from 'src/services/canjes'
import { COLORES, SOMBRAS } from 'src/theme'

interface Props {
  onResultado: (resultado: ResultadoCanje) => void
  onCancelar: () => void
}

function PedirPermiso({ onPermitir, onVolver }: { onPermitir: () => void; onVolver: () => void }) {
  return (
    <View style={estilos.permiso}>
      <View style={estilos.permisoIcono}>
        <Camera size={40} color={COLORES.principal} />
      </View>
      <Text style={estilos.permisoTitulo}>Necesitamos la cámara</Text>
      <Text style={estilos.permisoTexto}>
        Para leer el QR del cliente, TeacherV2 necesita acceso a la cámara del teléfono.
      </Text>
      <BotonPrimario label="Permitir cámara" onPress={onPermitir} />
      <BotonPrimario label="Volver" variante="contorno" onPress={onVolver} />
    </View>
  )
}

export function PantallaEscaner({ onResultado, onCancelar }: Props) {
  const [permiso, pedirPermiso] = useCameraPermissions()
  const [validando, setValidando] = useState(false)
  const yaLeido = useRef(false) // evita procesar el mismo QR varias veces

  if (!permiso) return <View style={estilos.pantalla} />

  if (!permiso.granted) {
    return <PedirPermiso onPermitir={pedirPermiso} onVolver={onCancelar} />
  }

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
        onBarcodeScanned={undefined}
      />

      <View style={estilos.marco}>
        <Text style={estilos.textoMarco}>Apuntá al QR del cliente</Text>
      </View>

      {validando && (
        <View style={estilos.cubierta}>
          <ActivityIndicator size="large" color={COLORES.blanco} />
          <Text style={estilos.textoValidando}>Validando canje…</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCancelar}
        disabled={validando}
        style={estilos.botonCancelar}
      >
        <X size={26} color={COLORES.blanco} />
      </TouchableOpacity>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  marco: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 3,
    borderColor: COLORES.principal,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 14,
  },
  textoMarco: {
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORES.blanco,
  },
  cubierta: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  textoValidando: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORES.blanco,
  },
  botonCancelar: {
    position: 'absolute',
    bottom: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(220,38,38,0.9)',
    ...SOMBRAS.grande,
  },

  // --- Pedido de permiso de cámara
  permiso: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: COLORES.blanco,
    padding: 24,
  },
  permisoIcono: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: COLORES.suave,
  },
  permisoTitulo: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.texto,
  },
  permisoTexto: {
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
  },
})
