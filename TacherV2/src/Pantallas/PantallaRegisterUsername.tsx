import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { User } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { TituloDePantalla } from 'src/components/TituloDePantalla'
import { useApp } from 'src/context/AppContext'
import { useErrorDeFormulario } from 'src/hooks/useErrorDeFormulario'
import { obtenerUidActual } from 'src/services/autenticacion'
import { registrarPerfil } from 'src/services/usuarios'
import { COLORES } from 'src/theme'
import { mensajeDeError } from 'src/utils/errores'

export function PantallaRegisterUsername() {
  const { navigate, flowData, setUserDocId } = useApp()
  const [nombre, setNombre] = useState(flowData.nombre ?? '')
  const [loading, setLoading] = useState(false)
  const { error, setError, limpiarAlEditar } = useErrorDeFormulario()

  const handleCompletarRegistro = async () => {
    setError('')
    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) return setError('Por favor ingresá un nombre de usuario.')

    setLoading(true)
    try {
      const uid = obtenerUidActual()
      if (!uid) return setError('Tu sesión expiró. Volvé al inicio e intentá de nuevo.')

      await registrarPerfil(uid, nombreLimpio, flowData)
      setUserDocId(uid)
      navigate('home')
    } catch (err) {
      console.error('Error al registrar en Firebase:', err)
      setError('No se pudo completar el registro: ' + mensajeDeError(err, 'Error del servidor'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Nombre de usuario" onBack={() => navigate('confirm-scan')} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.formulario}>
          <TituloDePantalla texto="¿Cómo te llamaremos?" />

          <CampoInput
            label="Elige tu nombre"
            placeholder="Ingresá tu nombre o apodo"
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
