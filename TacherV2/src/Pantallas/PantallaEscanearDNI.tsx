import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { useCameraPermissions } from 'expo-camera'
import { ScanLine, ShieldCheck, Sun } from 'lucide-react-native'
import { PresentacionEscaneoDNI, type AvisoDNI } from 'src/components/PresentacionEscaneoDNI'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { VistaCamaraDNI } from 'src/components/VistaCamaraDNI'
import { useApp } from 'src/context/AppContext'
import { useVolverAlRegistro } from 'src/hooks/useVolverAlRegistro'
import { obtenerUidActual } from 'src/services/autenticacion'
import { dniEnUsoPorOtro, MENSAJE_DNI_EN_USO } from 'src/services/usuarios'
import { PantallaCarga } from 'src/Pantallas/PantallaCarga'
import { COLORES } from 'src/theme'
import { extraerDniDesdeCodigo } from 'src/utils/dni'

const AVISOS: AvisoDNI[] = [
  { icon: Sun, text: 'Buscá un lugar con buena luz y apoyá el DNI sobre una superficie lisa.' },
  { icon: ScanLine, text: 'Escaneamos únicamente el código de barras del DNI.' },
  { icon: ShieldCheck, text: 'Tus datos se usan solo para identificarte al reciclar.' },
]

export function PantallaEscanearDNI() {
  const { navigate, actualizarFlowData } = useApp()
  const [permission, requestPermission] = useCameraPermissions()
  const [escaneando, setEscaneando] = useState(false)
  const [comprobando, setComprobando] = useState(false)
  const [error, setError] = useState('')
  const { volverAlRegistro, saliendo } = useVolverAlRegistro()

  const handleIniciarEscaneo = async () => {
    setError('')
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
    const dniLimpio = extraerDniDesdeCodigo(datos)
    if (!dniLimpio) return setError('No pudimos leer el DNI. Intentá escanearlo nuevamente.')

    const uid = obtenerUidActual()
    if (!uid) return setError('Tu sesión expiró. Volvé al registro e intentá de nuevo.')

    // Aviso temprano; al crear la cuenta se vuelve a comprobar dentro de la transacción
    setComprobando(true)
    try {
      if (await dniEnUsoPorOtro(dniLimpio, uid)) return setError(MENSAJE_DNI_EN_USO)
    } catch (err) {
      console.error('Error al comprobar el DNI:', err)
      return setError('No pudimos comprobar tu DNI. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setComprobando(false)
    }

    actualizarFlowData({ dni: dniLimpio })
    navigate('register-username')
  }

  if (saliendo) return <PantallaCarga mensaje="Volviendo al registro…" />

  if (escaneando) {
    return <VistaCamaraDNI onEscaneado={handleEscaneado} onCancelar={() => setEscaneando(false)} />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Verificá tu identidad" onBack={volverAlRegistro} />
      <PresentacionEscaneoDNI
        titulo="Vamos a escanear tu documento"
        descripcion="Necesitamos leer el código de barras de tu DNI para vincular tus reciclajes a tu cuenta. Así sabemos a quién sumarle los puntos en la caja."
        avisos={AVISOS}
        error={error}
        labelBoton="Escanear documento"
        onEscanear={handleIniciarEscaneo}
        cargando={comprobando}
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
