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
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { useGoogleAuthFlow } from 'src/hooks/useGoogleAuthFlow'
import { iniciarSesionConEmail } from 'src/services/autenticacion'
import { existePerfil } from 'src/services/usuarios'
import { COLORES } from 'src/theme'
import { mensajeDeError } from 'src/utils/errores'

export function PantallaLoginEmail() {
  const { navigate, actualizarFlowData, flowData, setUserDocId } = useApp()
  const [email, setEmail] = useState(flowData.email ?? '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { error, setError, limpiarAlEditar } = useErrorDeFormulario()
  const { iniciarSesionConGoogle, loadingGoogle } = useGoogleAuthFlow()

  const handleIniciarSesion = async () => {
    setError('')
    const correo = email.trim()

    if (!correo || !password) {
      return setError('Completá tu email y contraseña para continuar.')
    }

    setLoading(true)
    try {
      const resultado = await iniciarSesionConEmail(correo, password)
      if (!resultado.ok) return setError(resultado.mensaje)

      if (await existePerfil(resultado.uid)) {
        setUserDocId(resultado.uid)
        navigate('home')
      } else {
        // Registro que quedó a medias: se retoma en el escaneo de DNI
        actualizarFlowData({ email: correo, proveedor: 'email' })
        navigate('confirm-scan')
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError('Error al conectar con el servidor: ' + mensajeDeError(err, 'Intentalo más tarde.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setError('')
    iniciarSesionConGoogle(setError)
  }

  return (
    <View style={estilos.pantalla}>
      {/*<ScreenHeader title="Iniciar Sesión" onBack={() => navigate('welcome')} />*/}
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.formulario}>
          <TituloDePantalla texto="Ingresar cuenta" />

          <CampoInput
            label="Correo electrónico"
            placeholder="email@gmail.com"
            value={email}
            onChangeText={limpiarAlEditar(setEmail)}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={16} color={COLORES.verde} />}
          />

          <CampoInput
            label="Contraseña"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChangeText={limpiarAlEditar(setPassword)}
            secureTextEntry
            icon={<Lock size={16} color={COLORES.verde} />}
          />

          <MensajeError message={error} />

          <BotonPrimario label="Iniciar Sesión" onPress={handleIniciarSesion} loading={loading} />

         {/* <SeparadorO texto="o iniciar sesión con" />

          <BotonGoogle
            label="Iniciar sesión con Google"
            onPress={handleGoogle}
            loading={loadingGoogle}
          />*/}
        </View>

        <EnlaceAlternativo
          pregunta="¿No tenés cuenta?"
          accion="Registrate"
          onPress={() => navigate('register-email')}
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
    gap: 20,
  },
})
