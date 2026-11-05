import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCameraPermissions } from 'expo-camera'
import { CheckCircle2, IdCard, ScanLine, ShieldCheck } from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { VistaCamaraDNI } from 'src/components/VistaCamaraDNI'
import { useApp } from 'src/context/AppContext'
import { actualizarDni } from 'src/services/usuarios'
import { COLORES, SOMBRAS } from 'src/theme'
import { extraerDniDesdeCodigo } from 'src/utils/dni'

const AVISOS = [
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
    try {
      await actualizarDni(userData.id, dniLimpio)
      mostrarExito?.('DNI actualizado correctamente')
      navigate('perfil')
    } catch (error) {
      console.error('Error al actualizar el DNI:', error)
      setErrorDni('No se pudo actualizar el DNI. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (escaneando) {
    return <VistaCamaraDNI onEscaneado={handleEscaneado} onCancelar={() => setEscaneando(false)} />
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Actualizar DNI" onBack={() => navigate('perfil')} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View>
          <View style={estilos.iconoPrincipal}>
            <IdCard size={40} strokeWidth={1.75} color={COLORES.principal} />
          </View>

          <Text style={estilos.titulo}>Vincular nuevo DNI</Text>
          <Text style={estilos.descripcion}>
            Escaneá el código de barras de tu nuevo documento para actualizarlo en tu cuenta.
          </Text>

          <View style={estilos.dniActual}>
            <CheckCircle2 size={18} color={COLORES.principal} />
            <Text style={estilos.dniActualTexto}>
              DNI actual: <Text style={estilos.dniActualValor}>{userData?.DNI || '—'}</Text>
            </Text>
          </View>

          <View style={estilos.avisos}>
            {AVISOS.map(({ icon: Icono, text }) => (
              <View key={text} style={estilos.aviso}>
                <View style={estilos.avisoIcono}>
                  <Icono size={20} color={COLORES.principal} />
                </View>
                <Text style={estilos.avisoTexto}>{text}</Text>
              </View>
            ))}
          </View>
          <MensajeError message={errorDni} />
        </View>

        <BotonPrimario
          label={guardando ? 'Actualizando...' : 'Escanear y actualizar'}
          onPress={handleIniciarEscaneo}
          loading={guardando}
          disabled={guardando}
          icon={!guardando ? <ScanLine size={20} color={COLORES.blanco} /> : undefined}
          style={estilos.botonEscanear}
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
  iconoPrincipal: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.verde200,
    backgroundColor: COLORES.suave,
    ...SOMBRAS.chica,
  },
  titulo: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORES.gris900,
  },
  descripcion: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22.75,
    color: COLORES.gris500,
  },
  dniActual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    borderRadius: 9999,
    backgroundColor: COLORES.suave,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  dniActualTexto: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  dniActualValor: {
    fontWeight: '700',
    color: COLORES.texto,
  },
  avisos: {
    marginTop: 32,
    gap: 12,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.verde100,
    backgroundColor: COLORES.verde50,
    padding: 16,
    ...SOMBRAS.chica,
  },
  avisoIcono: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORES.verde100,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16.5,
    color: COLORES.gris600,
  },
  botonEscanear: {
    marginTop: 32,
  },
})
