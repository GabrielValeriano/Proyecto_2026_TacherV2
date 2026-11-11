import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { KeyRound, Lock } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { validarNuevaContrasena } from 'src/domain/validaciones'
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { cambiarContrasenaRecuperada } from 'src/services/recuperacion'
import { COLORES, SOMBRAS } from 'src/theme'

function TituloDecorado() {
  return (
    <View style={estilos.titulo}>
      <View style={estilos.circuloDecorativoGrande} />
      <View style={estilos.circuloDecorativoChico} />
      <View style={estilos.tituloIcono}>
        <KeyRound size={30} color={COLORES.blanco} />
      </View>
      <Text style={estilos.tituloTexto}>Nueva contraseña</Text>
      <Text style={estilos.tituloSubtexto}>Ya verificamos tu correo. Elegí una contraseña nueva para tu cuenta.</Text>
    </View>
  )
}

/** Recuperación, paso 3 de 3: nueva contraseña. Al terminar vuelve al Login. */
export function PantallaRecuperarContrasena() {
  const { navigate, flowData, actualizarFlowData, mostrarExito } = useApp()
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [loading, setLoading] = useState(false)
  const { error, setError, limpiarAlEditar } = useErrorDeFormulario()

  const salir = () => {
    actualizarFlowData({ tokenRecuperacion: undefined })
    navigate('login-email')
  }

  const handleFinalizar = async () => {
    setError('')
    const errorDeValidacion = validarNuevaContrasena(nueva, confirmacion)
    if (errorDeValidacion) return setError(errorDeValidacion)

    const { email, tokenRecuperacion } = flowData
    if (!email || !tokenRecuperacion) {
      return setError('La verificación venció. Volvé a pedir un código.')
    }

    setLoading(true)
    const resultado = await cambiarContrasenaRecuperada(email, tokenRecuperacion, nueva)
    setLoading(false)
    if (!resultado.ok) return setError(resultado.mensaje)

    mostrarExito?.('¡Listo! Iniciá sesión con tu nueva contraseña.', 3500)
    salir()
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Cambiar contraseña" onBack={salir} />
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <TituloDecorado />

        <View style={estilos.formulario}>
          <CampoInput
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={nueva}
            onChangeText={limpiarAlEditar(setNueva)}
            secureTextEntry
            autoComplete="new-password"
            icon={<Lock size={16} color={COLORES.verde} />}
          />

          <CampoInput
            label="Verificar contraseña"
            placeholder="Repetí la contraseña nueva"
            value={confirmacion}
            onChangeText={limpiarAlEditar(setConfirmacion)}
            secureTextEntry
            autoComplete="new-password"
            icon={<Lock size={16} color={COLORES.verde} />}
          />

          <MensajeError message={error} />

          <BotonPrimario label="Finalizar" onPress={handleFinalizar} loading={loading} />
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
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  formulario: {
    gap: 16,
  },

  // --- Título grande decorado
  titulo: {
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORES.principal,
    backgroundColor: COLORES.oscuro,
    paddingHorizontal: 22,
    paddingVertical: 28,
    ...SOMBRAS.media,
  },
  circuloDecorativoGrande: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circuloDecorativoChico: {
    position: 'absolute',
    bottom: -35,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tituloIcono: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORES.acento,
    backgroundColor: COLORES.principal,
  },
  tituloTexto: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.75,
    color: COLORES.blanco,
  },
  tituloSubtexto: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.sobreOscuro,
  },
})
