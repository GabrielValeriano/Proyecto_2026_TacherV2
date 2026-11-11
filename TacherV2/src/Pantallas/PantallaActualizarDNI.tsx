import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { useCameraPermissions } from 'expo-camera'
import { CheckCircle2, ScanLine, ShieldCheck, Sun } from 'lucide-react-native'
import { DniActual, PresentacionEscaneoDNI, type AvisoDNI } from 'src/components/PresentacionEscaneoDNI'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { VistaCamaraDNI } from 'src/components/VistaCamaraDNI'
import { useApp } from 'src/context/AppContext'
import { actualizarDni } from 'src/services/usuarios'
import { COLORES } from 'src/theme'
import { extraerDniDesdeCodigo } from 'src/utils/dni'

const AVISOS: AvisoDNI[] = [
  { icon: Sun, text: 'Buscá un lugar con buena luz y apoyá el DNI sobre una superficie lisa.' },
  { icon: ScanLine, text: 'Escaneamos únicamente el código de barras del DNI.' },
  { icon: ShieldCheck, text: 'Solo se actualiza el DNI vinculado a tu cuenta.' },
]

export function PantallaActualizarDNI() {
  const { userData, navigate, mostrarExito } = useApp()
  const [permission, requestPermission] = useCameraPermissions()
  const [escaneando, setEscaneando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorDni, setErrorDni] = useState('')

  const handleIniciarEscaneo = async () => {
    setErrorDni('')
    if (!permission?.granted) {
      const respuesta = await requestPermission()
      if (!respuesta.granted) {
        return Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para poder escanear el código de barras de tu DNI.',
        )
      }
    }
    setEscaneando(true)
  }

  const handleEscaneado = async (datos: string) => {
    setEscaneando(false)
    setErrorDni('')
    if (!userData?.id) {
      setErrorDni('No se encontró tu usuario. Volvé a iniciar sesión.')
      return
    }
    const dniLimpio = extraerDniDesdeCodigo(datos)
    if (!dniLimpio) {
      setErrorDni('No pudimos leer el DNI. Intentá escanearlo nuevamente.')
      return
    }
    if (dniLimpio === userData.DNI) {
      setErrorDni('Ya estás usando ese DNI.')
      return
    }
    setGuardando(true)
    const resultado = await actualizarDni(userData.id, userData.DNI ?? '', dniLimpio)
    setGuardando(false)
    if (!resultado.ok) return setErrorDni(resultado.mensaje)

    mostrarExito?.('DNI actualizado correctamente')
    navigate('perfil')
  }

  if (escaneando) {
    return <VistaCamaraDNI onEscaneado={handleEscaneado} onCancelar={() => setEscaneando(false)} />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Actualizar DNI" onBack={() => navigate('perfil')} />
      <PresentacionEscaneoDNI
        titulo="Vincular nuevo DNI"
        descripcion="Escaneá el código de barras de tu nuevo documento para actualizarlo en tu cuenta."
        detalle={<DniActual dni={userData?.DNI || '—'} icono={CheckCircle2} />}
        avisos={AVISOS}
        error={errorDni}
        labelBoton={guardando ? 'Actualizando…' : 'Escanear y actualizar'}
        onEscanear={handleIniciarEscaneo}
        cargando={guardando}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.blanco,
  },
})
