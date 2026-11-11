import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { User } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { useApp } from 'src/context/AppContext'
import {
  LARGO_MAXIMO_NOMBRE,
  LARGO_MINIMO_NOMBRE,
  limpiarNombreUsuario,
  validarNombreUsuario,
} from 'src/domain/nombreUsuario'
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { obtenerUidActual } from 'src/services/autenticacion'
import { registrarPerfil } from 'src/services/usuarios'
import { COLORES } from 'src/theme'
import { PantallaCarga } from 'src/Pantallas/PantallaCarga'

export function PantallaRegisterUsername() {
  const { navigate, flowData, setUserDocId } = useApp()
  const [nombre, setNombre] = useState(flowData.nombre ?? '')
  const [loading, setLoading] = useState(false)
  const { error, setError, limpiarAlEditar } = useErrorDeFormulario()

  const handleCompletarRegistro = async () => {
    setError('')
    const nombreLimpio = limpiarNombreUsuario(nombre)

    // Se valida antes de mandar nada a Firestore
    const errorDeNombre = validarNombreUsuario(nombreLimpio)
    if (errorDeNombre) return setError(errorDeNombre)

    setLoading(true)
    try {
      const uid = obtenerUidActual()
      if (!uid) return setError('Tu sesión expiró. Volvé al inicio e intentá de nuevo.')

      const resultado = await registrarPerfil(uid, nombreLimpio, flowData)
      if (!resultado.ok) return setError(resultado.mensaje)
      setUserDocId(uid)
      navigate('home')
    } catch (err) {
      console.error('Error al registrar en Firebase:', err)
      setError('No pudimos completar el registro. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PantallaCarga mensaje="Creando tu cuenta…" />

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Nombre de usuario" onBack={() => navigate('confirm-scan')} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.formulario}>
          <TituloDePantalla texto="¿Cómo te llamaremos?" />

          <CampoInput
            label="Elige tu nombre"
            placeholder={`Tu apodo (${LARGO_MINIMO_NOMBRE} a ${LARGO_MAXIMO_NOMBRE} caracteres)`}
            value={nombre}
            onChangeText={limpiarAlEditar(setNombre)}
            icon={<User size={16} color={COLORES.verde} />}
          />

          <MensajeError message={error} />
        </View>

        <BotonPrimario
          label="Finalizar registro"
          onPress={handleCompletarRegistro}
          loading={loading}
          style={estilos.botonFinalizar}
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
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  formulario: {
    gap: 24,
  },
  botonFinalizar: {
    marginTop: 24,
  },
})
