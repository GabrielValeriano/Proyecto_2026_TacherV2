import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { KeyRound, Mail } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { useApp } from 'src/context/AppContext'
import { esEmailValido } from 'src/domain/validaciones'
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { solicitarCodigoRecuperacion } from 'src/services/recuperacion'
import { COLORES, SOMBRAS } from 'src/theme'

/** Recuperación, paso 1 de 3: el usuario ingresa su mail y le mandamos el código. */
export function PantallaRecuperarEmail() {
  const { navigate, flowData, actualizarFlowData } = useApp()
  const [email, setEmail] = useState(flowData.email ?? '')
  const [loading, setLoading] = useState(false)
  const { error, setError, limpiarAlEditar } = useErrorDeFormulario()

  const handleSiguiente = async () => {
    setError('')
    const correo = email.trim().toLowerCase()
    if (!correo) return setError('Ingresá tu correo electrónico.')
    if (!esEmailValido(correo)) return setError('Ingresá un correo electrónico válido (ejemplo@gmail.com).')

    setLoading(true)
    const resultado = await solicitarCodigoRecuperacion(correo)
    setLoading(false)
    if (!resultado.ok) return setError(resultado.mensaje)

    actualizarFlowData({ email: correo, tokenRecuperacion: undefined })
    navigate('recuperar-codigo')
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Recuperar contraseña" onBack={() => navigate('login-email')} />
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.formulario}>
          <View style={estilos.icono}>
            <KeyRound size={40} strokeWidth={1.75} color={COLORES.verde} />
          </View>

          <TituloDePantalla texto="¿Olvidaste tu contraseña?" />

          <Text style={estilos.descripcion}>
            Ingresá el correo de tu cuenta y te enviamos un código de 8 dígitos para crear una
            contraseña nueva.
          </Text>

          <CampoInput
            label="Correo electrónico"
            placeholder="email@gmail.com"
            value={email}
            onChangeText={limpiarAlEditar(setEmail)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            icon={<Mail size={16} color={COLORES.verde} />}
          />

          <MensajeError message={error} />

          <BotonPrimario label="Siguiente" onPress={handleSiguiente} loading={loading} />
        </View>
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formulario: {
    gap: 16,
  },
  icono: {
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
  descripcion: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
})
