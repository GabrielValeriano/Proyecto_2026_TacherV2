import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  ChevronDown,
  ChevronUp,
  KeyRound,
  Lock,
  Mail,
  User,
  type LucideIcon,
} from 'lucide-react-native'
import { BotonPrimario } from 'src/components/BotonPrimario'
import { CampoInput } from 'src/components/CampoInput'
import { MensajeError } from 'src/components/MensajeError'
import { ScreenHeader } from 'src/components/ScreenHeader'
import { useApp } from 'src/context/AppContext'
import { actualizarNombreAuth, cambiarContrasenaActual } from 'src/services/autenticacion'
import { actualizarNombreUsuario } from 'src/services/usuarios'
import {
  LARGO_MAXIMO_NOMBRE,
  LARGO_MINIMO_NOMBRE,
  limpiarNombreUsuario,
  validarNombreUsuario,
} from 'src/domain/nombreUsuario'
import { COLORES, SOMBRAS, RADIOS } from 'src/theme'

interface SeccionDesplegableProps {
  icono: LucideIcon
  titulo: string
  abierto: boolean
  onToggle: () => void
  children: React.ReactNode
}

function SeccionDesplegable({
  icono: Icono,
  titulo,
  abierto,
  onToggle,
  children,
}: SeccionDesplegableProps) {
  return (
    <View style={estilos.seccion}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={[estilos.seccionCabecera, abierto && estilos.seccionCabeceraAbierta]}
      >
        <View style={estilos.seccionIcono}>
          <Icono size={22} color={COLORES.principal} />
        </View>
        <Text style={estilos.seccionTitulo}>{titulo}</Text>
        {abierto ? (
          <ChevronUp size={22} color={COLORES.gris400} />
        ) : (
          <ChevronDown size={22} color={COLORES.gris400} />
        )}
      </TouchableOpacity>
      {abierto && <View style={estilos.seccionContenido}>{children}</View>}
    </View>
  )
}

export function PantallaAjustes() {
  const { userData, navigate, mostrarExito } = useApp()

  const [seccionAbierta, setSeccionAbierta] = useState<'nombre' | 'contrasena' | null>(null)

  // Cambiar nombre
  const [nuevoNombre, setNuevoNombre] = useState(userData?.Nombre || '')
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [errorNombre, setErrorNombre] = useState('')

  // Cambiar contraseña
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [contrasenaNueva, setContrasenaNueva] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [guardandoContrasena, setGuardandoContrasena] = useState(false)
  const [errorContrasena, setErrorContrasena] = useState('')

  const proveedor = userData?.Proveedor
  const esGoogle = proveedor === 'google.com'

  const toggleSeccion = (seccion: 'nombre' | 'contrasena') => {
    if (seccionAbierta === seccion) {
      setSeccionAbierta(null)
      setErrorNombre('')
      setErrorContrasena('')
      return
    }
    setSeccionAbierta(seccion)
    setErrorNombre('')
    setErrorContrasena('')
    if (seccion === 'nombre') {
      setNuevoNombre(userData?.Nombre || '')
    }
    if (seccion === 'contrasena') {
      setContrasenaActual('')
      setContrasenaNueva('')
      setConfirmarContrasena('')
    }
  }

  const handleGuardarNombre = async () => {
    setErrorNombre('')
    const nombreLimpio = limpiarNombreUsuario(nuevoNombre)
    if (!userData?.id) {
      setErrorNombre('No se encontró tu usuario.')
      return
    }
    // Se valida antes de mandar nada a Firestore
    const errorDeNombre = validarNombreUsuario(nombreLimpio)
    if (errorDeNombre) {
      setErrorNombre(errorDeNombre)
      return
    }
    if (nombreLimpio === userData.Nombre) {
      setErrorNombre('Ya estás usando ese nombre de usuario.')
      return
    }

    setGuardandoNombre(true)
    try {
      const resultado = await actualizarNombreUsuario(userData.id, userData.Nombre, nombreLimpio)
      if (!resultado.ok) {
        setErrorNombre(resultado.mensaje)
        return
      }
      try {
        await actualizarNombreAuth(nombreLimpio)
      } catch (error) {
        console.error('No se pudo actualizar el displayName en Auth:', error)
      }
      mostrarExito?.('Nombre actualizado correctamente')
      setSeccionAbierta(null)
      setErrorNombre('')
      navigate('perfil')
    } finally {
      setGuardandoNombre(false)
    }
  }

  const handleGuardarContrasena = async () => {
    setErrorContrasena('')
    if (esGoogle) {
      Alert.alert(
        'No disponible',
        'Las cuentas creadas con Google no permiten cambiar la contraseña desde la app.',
      )
      return
    }
    if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
      setErrorContrasena('Completá todos los campos para cambiar la contraseña.')
      return
    }
    if (contrasenaNueva.length < 8) {
      setErrorContrasena('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (contrasenaNueva !== confirmarContrasena) {
      setErrorContrasena('Las contraseñas nuevas no coinciden.')
      return
    }
    if (contrasenaNueva === contrasenaActual) {
      setErrorContrasena('Ya estás usando esa contraseña.')
      return
    }

    setGuardandoContrasena(true)
    try {
      const resultado = await cambiarContrasenaActual(contrasenaActual, contrasenaNueva)
      if (!resultado.ok) {
        setErrorContrasena(resultado.mensaje)
        return
      }
      setContrasenaActual('')
      setContrasenaNueva('')
      setConfirmarContrasena('')
      mostrarExito?.('Contraseña actualizada correctamente')
      setSeccionAbierta(null)
      setErrorContrasena('')
      navigate('perfil')
    } finally {
      setGuardandoContrasena(false)
    }
  }

  return (
    <View style={estilos.pantalla}>
      <ScreenHeader title="Ajustes" onBack={() => navigate('perfil')} />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <Text style={estilos.subtitulo}>Gestioná tu cuenta desde aquí</Text>

        <SeccionDesplegable
          icono={User}
          titulo="Cambiar nombre de usuario"
          abierto={seccionAbierta === 'nombre'}
          onToggle={() => toggleSeccion('nombre')}
        >
          <Text style={estilos.ayuda}>Tu nombre actual: @{userData?.Nombre || 'Usuario'}</Text>
          <CampoInput
            label="Nuevo nombre de usuario"
            placeholder={`De ${LARGO_MINIMO_NOMBRE} a ${LARGO_MAXIMO_NOMBRE} caracteres`}
            value={nuevoNombre}
            onChangeText={(texto) => {
              setNuevoNombre(texto)
              if (errorNombre) setErrorNombre('')
            }}
            autoCapitalize="none"
            returnKeyType="done"
          />
          <MensajeError message={errorNombre} />
          <BotonPrimario
            label={guardandoNombre ? 'Guardando...' : 'Guardar nombre'}
            onPress={handleGuardarNombre}
            loading={guardandoNombre}
            disabled={guardandoNombre}
            style={estilos.botonInterno}
          />
        </SeccionDesplegable>

        <SeccionDesplegable
          icono={KeyRound}
          titulo="Cambiar contraseña"
          abierto={seccionAbierta === 'contrasena'}
          onToggle={() => toggleSeccion('contrasena')}
        >
          {esGoogle ? (
            <View style={estilos.avisoGoogle}>
              <Mail size={18} color={COLORES.principal} />
              <Text style={estilos.avisoGoogleTexto}>
                Iniciaste sesión con Google. Para cambiar la contraseña debés hacerlo desde tu
                cuenta de Google.
              </Text>
            </View>
          ) : (
            <>
              <CampoInput
                label="Contraseña actual"
                placeholder="Ingresá tu contraseña actual"
                value={contrasenaActual}
                onChangeText={(texto) => {
                  setContrasenaActual(texto)
                  if (errorContrasena) setErrorContrasena('')
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              <CampoInput
                label="Nueva contraseña"
                placeholder="Mínimo 8 caracteres"
                value={contrasenaNueva}
                onChangeText={(texto) => {
                  setContrasenaNueva(texto)
                  if (errorContrasena) setErrorContrasena('')
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              <CampoInput
                label="Confirmar nueva contraseña"
                placeholder="Repetí la nueva contraseña"
                value={confirmarContrasena}
                onChangeText={(texto) => {
                  setConfirmarContrasena(texto)
                  if (errorContrasena) setErrorContrasena('')
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              <MensajeError message={errorContrasena} />
              <BotonPrimario
                label={guardandoContrasena ? 'Guardando...' : 'Guardar contraseña'}
                onPress={handleGuardarContrasena}
                loading={guardandoContrasena}
                disabled={guardandoContrasena}
                icon={<Lock size={18} color={COLORES.blanco} />}
                style={estilos.botonInterno}
              />
            </>
          )}
        </SeccionDesplegable>
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitulo: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORES.textoSuave,
  },

  // --- Secciones
  seccion: {
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.linea,
    backgroundColor: COLORES.blanco,
    overflow: 'hidden',
    ...SOMBRAS.chica,
  },
  seccionCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  seccionCabeceraAbierta: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.linea,
  },
  seccionIcono: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORES.suave,
  },
  seccionTitulo: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORES.texto,
  },
  seccionContenido: {
    gap: 14,
    padding: 16,
  },
  ayuda: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
  },
  botonInterno: {
    marginTop: 4,
  },
  avisoGoogle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    backgroundColor: COLORES.suave,
    padding: 12,
  },
  avisoGoogleTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORES.textoSuave,
  },
})