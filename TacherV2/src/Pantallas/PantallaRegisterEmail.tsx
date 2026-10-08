import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import { BotonGoogle } from 'src/components/BotonGoogle'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { EnlaceAlternativo } from 'src/components/EnlaceAlternativo'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { SeparadorO } from 'src/components/SeparadorO'
import { useApp } from 'src/context/AppContext'
import { validarCredencialesRegistro } from 'src/domain/validaciones'
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { useGoogleAuthFlow } from 'src/hooks/useGoogleAuthFlow'
import { crearOReanudarCuentaEmail } from 'src/services/autenticacion'
import { COLORES } from 'src/theme'
import { mensajeDeError } from 'src/utils/errores'

export function PantallaRegisterEmail() {
  const { navigate, actualizarFlowData, flowData } = useApp()
  const [email, setEmail] = useState(flowData.email ?? '')
  const [contra, setContra] = useState('')
  const [loading, setLoading] = useState(false)
  const { error, setError, limpiarAlEditar } = useErrorDeFormulario()
  const { registrarConGoogle, loadingGoogle } = useGoogleAuthFlow()

  const handleSiguiente = async () => {
    setError('')
    const correo = email.trim()

    const errorDeValidacion = validarCredencialesRegistro(correo, contra)
    if (errorDeValidacion) return setError(errorDeValidacion)

    setLoading(true)
    try {
      const resultado = await crearOReanudarCuentaEmail(correo, contra)
      if (!resultado.ok) return setError(resultado.mensaje)

      actualizarFlowData({ email: correo, proveedor: 'email' })
      navigate('login-code')
    } catch (err) {
      console.error('Error al crear la cuenta:', err)
      setError('Error al crear la cuenta: ' + mensajeDeError(err, 'Error de conexión'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setError('')
    registrarConGoogle(setError)
  }

  return (
    <View style={estilos.pantalla}>
      {/*<ScreenHeader title="Registrarse" onBack={() => navigate('welcome')} />*/}
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.formulario}>
          <TituloDePantalla texto="Crear cuenta" />

          {/*<Text style={estilos.descripcion}>
            Ingresá un email real para enviar un codigo de verificación. 
          </Text>*/}

          <CampoInput
            label="Correo electrónico"
            keyboardType="email-address"
            placeholder="nombre@gmail.com"
            value={email}
            onChangeText={limpiarAlEditar(setEmail)}
            autoCapitalize="none"
            icon={<Mail size={16} color={COLORES.verde} />}
          />

          <CampoInput
            label="Contraseña"
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
            value={contra}
            onChangeText={limpiarAlEditar(setContra)}
            icon={<Lock size={16} color={COLORES.verde} />}
          />

          <MensajeError message={error} />

          <BotonPrimario
            label="Siguiente"
            onPress={handleSiguiente}
            loading={loading}
            style={estilos.botonSiguiente}
          />

        {/*  <SeparadorO texto="o registrarme con" />

          <BotonGoogle
            label="Registrarse con Google"
            onPress={handleGoogle}
            loading={loadingGoogle}
          />*/}
        </View>

        <EnlaceAlternativo
          pregunta="¿Ya tenés cuenta?"
          accion="Iniciá sesión"
          onPress={() => navigate('login-email')}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  formulario: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  descripcion: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  botonSiguiente: {
    marginTop: 8,
  },
})
