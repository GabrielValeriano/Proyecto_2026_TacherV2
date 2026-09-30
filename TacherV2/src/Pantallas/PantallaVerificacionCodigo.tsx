import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { KeyRound } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { useCodigoVerificacion } from 'src/hooks/useCodigoVerificacion'
import { COLORES } from 'src/theme'

export function PantallaVerificacionCodigo() {
  const { navigate, flowData } = useApp()
  const [codigoIngresado, setCodigoIngresado] = useState('')
  const { enviando, error, limpiarError, reenviar, verificar } = useCodigoVerificacion(
    flowData.email,
  )

  const handleVerificar = () => {
    // La cuenta se crea después del escaneo de DNI, así que solo avanzamos
    if (verificar(codigoIngresado)) navigate('confirm-scan')
  }

  const handleCambioCodigo = (texto: string) => {
    limpiarError()
    setCodigoIngresado(texto)
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Código de verificación" onBack={() => navigate('register-email')} />
      <View style={estilos.contenido}>
        <View style={estilos.formulario}>
          <Text style={estilos.descripcion}>
            Enviamos un código de confirmación de 6 dígitos a{' '}
            <Text style={estilos.correoDestino}>{flowData.email}</Text>
          </Text>

          <CampoInput
            label="Código de seguridad"
            placeholder="Ej: 849201"
            keyboardType="number-pad"
            maxLength={6}
            value={codigoIngresado}
            onChangeText={handleCambioCodigo}
            icon={<KeyRound size={16} color={COLORES.verde} />}
          />

          <MensajeError message={error} />

          {enviando ? (
            <ActivityIndicator size="large" color={COLORES.verde} style={estilos.cargando} />
          ) : (
            <BotonPrimario label="Verificar e ingresar" onPress={handleVerificar} />
          )}

          <TouchableOpacity activeOpacity={0.7} onPress={reenviar} style={estilos.enlaceReenviar}>
            <Text style={estilos.textoReenviar}>
              ¿No recibiste el código? <Text style={estilos.textoReenviarAccion}>Reenviar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  formulario: {
    gap: 20,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  correoDestino: {
    fontWeight: '600',
    color: COLORES.gris800,
  },
  cargando: {
    marginVertical: 10,
  },
  enlaceReenviar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textoReenviar: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: COLORES.gris500,
  },
  textoReenviarAccion: {
    color: COLORES.verde600,
  },
})
