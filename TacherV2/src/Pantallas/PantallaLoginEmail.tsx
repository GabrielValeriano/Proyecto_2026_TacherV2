import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Lock, Mail } from 'lucide-react-native'
import { BotonGoogle } from 'src/components/BotonGoogle'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { EnlaceAlternativo } from 'src/components/EnlaceAlternativo'
import { MensajeError } from 'src/components/MensajeError'
import { MensajeExito } from 'src/components/MensajeExito'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { SeparadorO } from 'src/components/SeparadorO'
import { useApp } from 'src/context/AppContext'
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { useGoogleAuthFlow } from 'src/hooks/useGoogleAuthFlow'
import { iniciarSesionConEmail } from 'src/services/autenticacion'
import { existePerfil } from 'src/services/usuarios'
import { COLORES } from 'src/theme'
import { PantallaCarga } from 'src/Pantallas/PantallaCarga'

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
        // La cuenta existe en Auth pero el registro quedó a medias: lo retomamos.
        // La pantalla de verificación avanza sola si el correo ya estaba verificado.
        actualizarFlowData({ email: correo, proveedor: 'email' })
        navigate('login-code')
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError('Ocurrió un problema de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleOlvideContrasena = () => {
    // Si ya escribió el mail, lo llevamos completado a la pantalla de recuperación
    actualizarFlowData({ email: email.trim() || undefined })
    navigate('recuperar-email')
  }

  const handleGoogle = () => {
    setError('')
    iniciarSesionConGoogle(setError)
  }

  if (loading || loadingGoogle) {
      return <PantallaCarga mensaje={loadingGoogle ? 'Conectando con Google…' : 'Iniciando sesión…'} />
    }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Iniciar Sesión" onBack={() => navigate('welcome')} />
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

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOlvideContrasena}
            style={estilos.enlaceOlvide}
          >
            <Text style={estilos.textoOlvide}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <BotonPrimario label="Iniciar Sesión" onPress={handleIniciarSesion} loading={loading} />

         <SeparadorO texto="o iniciar sesión con" />

          <BotonGoogle
            label="Iniciar sesión con Google"
            onPress={handleGoogle}
            loading={loadingGoogle}
          />
        </View>

        {/* El error va entre Google y el enlace inferior. El espacio está reservado: cuando
            aparece no empuja los campos de arriba. */}
        <View style={estilos.zonaError}>
          <MensajeError message={error} />
        </View>

        <EnlaceAlternativo
          pregunta="¿No tenés cuenta?"
          accion="Registrate"
          onPress={() => navigate('register-email')}
        />
      </ScrollView>
      <MensajeExito />
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
  zonaError: {
    minHeight: 64,
    justifyContent: 'center',
  },
  enlaceOlvide: {
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingVertical: 4,
  },
  textoOlvide: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORES.verde600,
  },
})
