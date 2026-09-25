import React, { useState, useEffect, createContext, useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import {
  Gift,
  Leaf,
  ArrowRight,
  Info,
  Recycle,
  Mail,
  Lock,
  ScanLine,
  ShieldCheck,
  IdCard,
  ChevronLeft,
  Award,
  Zap,
  Home,
  User,
  KeyRound,
  CheckCircle2,
} from 'lucide-react-native'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore'
import { db } from 'src/firebase'
import emailjs from '@emailjs/react-native'

// ASIGNACION DE RANGOS
const ListaDeRangos = [
  { name: 'Brote', min: 0, icon: Leaf },
  { name: 'Planta', min: 500, icon: Zap },
  { name: 'Arbol', min: 2000, icon: Award },
]

function getRangosParaPuntos(puntos = 0) {
  let RangoActual = ListaDeRangos[0]
  for (const r of ListaDeRangos) {
    if (puntos >= r.min) RangoActual = r
  }
  return RangoActual
}

function getProximoRango(puntos = 0) {
  for (const r of ListaDeRangos) {
    if (puntos < r.min) return r
  }
  return null
}

// CONTEXTO DE APLICACIÓN
const AppContext = createContext(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider')
  return context
}

// COMPONENTES SECUNDARIOS DE TEACHERV2
function TeacherV2Logo({ size = 36, withWordmark = false }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center rounded-xl bg-green-600"
      >
        <Recycle size={size * 0.6} color="#FFF" />
      </View>
      {withWordmark && (
        <Text className="text-xl font-bold tracking-tight text-gray-900">
          Teacher<Text className="text-green-600">V2</Text>
        </Text>
      )}
    </View>
  )
}

function ScreenHeader({ title: titulo, onBack }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
      {onBack && (
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} className="p-1">
          <ChevronLeft size={24} color="#16a34a" />
        </TouchableOpacity>
      )}
      <Text className="text-base font-bold text-green-700">{titulo}</Text>
    </View>
  )
}

function CampoInput({ label, icon, value, onChangeText, error, ...props }) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-xs font-semibold text-green-800">{label}</Text>
      )}
      <View className={`flex-row items-center gap-2.5 rounded-2xl border ${error ? 'border-red-500' : 'border-green-200'} bg-white px-3.5 py-3 shadow-xs`}>
        {icon}
        <TextInput
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          className="flex-1 text-sm text-gray-900 p-0"
          {...props}
        />
      </View>
    </View>
  )
}

function MensajeError({ message }) {
  if (!message) return null
  return (
    <View className="my-2 rounded-2xl border border-red-300 bg-red-50 p-3">
      <Text className="text-center text-xs font-medium text-red-600">
        ⚠️ {message}
      </Text>
    </View>
  )
}

function BotonGoogle({ label, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="h-12 w-full flex-row items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white shadow-xs"
    >
      <View className="size-5 items-center justify-center rounded-full bg-red-500">
        <Text className="text-xs font-bold text-white">G</Text>
      </View>
      <Text className="font-semibold text-sm text-gray-700">{label}</Text>
    </TouchableOpacity>
  )
}

function BarraDeNavegacion({ activeTab, onTabPress }) {
  const tabs = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'reciclar', label: 'Reciclar', icon: Recycle },
    { id: 'canjes', label: 'Canjes', icon: Gift },
    { id: 'perfil', label: 'Perfil', icon: User },
  ]

  return (
    <View className="flex-row justify-around items-center bg-white border-t border-green-100 py-2 px-4 elevation-5">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.id, tab.label)}
            className="items-center py-1 px-3"
          >
            <Icon size={22} color={isActive ? '#16a34a' : '#9ca3af'} />
            <Text className={`text-xs mt-1 font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// -------------------------------------------------------------
// NUEVAS PANTALLAS DE AUTENTICACIÓN Y NAVEGACIÓN
// -------------------------------------------------------------

// 1. PANTALLA PRINCIPAL BIENVENIDA (LANDING)
export function PantallaWelcome() {
  const { navigate } = useApp()

  return (
    <View className="flex-1 bg-white justify-between px-6 pb-12 pt-16">
      <View className="items-center gap-6">
        <View className="rounded-3xl bg-green-50 p-6 border border-green-200">
          <TeacherV2Logo size={72} withWordmark />
        </View>
        <View className="items-center gap-2">
          <Text className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Reciclar Con Un Propósito
          </Text>
          <Text className="text-sm text-gray-500 leading-relaxed text-center px-4">
            Sumá puntos reciclando en tu escuela y canjealos por recompensas increíbles.
          </Text>
        </View>
      </View>

      <View className="gap-3 w-full">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigate('login-email')}
          className="h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
        >
          <Text className="font-semibold text-base text-white">Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigate('register-email')}
          className="h-12 w-full items-center justify-center rounded-2xl border border-green-600 bg-white shadow-xs"
        >
          <Text className="font-semibold text-base text-green-600">Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// 2. REGISTRO - PASO 1: INGRESAR EMAIL O GOOGLE
export function PantallaRegisterEmail() {
  const { navigate, setFlowData, flowData } = useApp()
  const [email, setEmail] = useState(flowData?.email || '')
  const [error, setError] = useState('')

  const handleSiguiente = () => {
    setError('')
    if (!email.trim()) {
      return setError('Por favor ingresá tu correo electrónico.')
    }
    setFlowData({ ...flowData, email: email.trim() })
    navigate('register-password')
  }

  const handleGoogleRegister = () => {
    // Simulación de Auth Google
    navigate('confirm-scan')
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Registrarse" onBack={() => navigate('welcome')} />
      <ScrollView contentContainerClassName="flex-grow justify-between px-6 pb-8 pt-6">
        <View className="gap-5">
          <Text className="text-sm text-gray-500 leading-relaxed">
            Ingresá tu correo electrónico para comenzar a crear tu cuenta.
          </Text>

          <CampoInput
            label="Correo electrónico"
            keyboardType="email-address"
            placeholder="nombre@escuela.uba.ar"
            value={email}
            onChangeText={(t) => { setError(''); setEmail(t); }}
            autoCapitalize="none"
            icon={<Mail size={16} color="#16a34a" />}
          />

          <MensajeError message={error} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSiguiente}
            className="h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
          >
            <Text className="font-semibold text-base text-white">Siguiente</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400 font-medium">o registrarme con</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <BotonGoogle label="Continuar con Google" onPress={handleGoogleRegister} />
        </View>

        <View className="flex-row items-center justify-center gap-1 mt-6">
          <Text className="text-sm text-gray-500">¿Ya tenés cuenta?</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('login-email')}>
            <Text className="text-sm font-bold text-green-600">Iniciá sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

// 3. REGISTRO - PASO 2: ASIGNAR CONTRASEÑA
export function PantallaRegisterPassword() {
  const { navigate, flowData, setUserDocId } = useApp()
  const [contra, setContra] = useState('')
  const [confirmContra, setConfirmContra] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCompletarRegistro = async () => {
    setError('')
    if (!contra || !confirmContra) {
      return setError('Completá ambos campos de contraseña.')
    }
    if (contra !== confirmContra) {
      return setError('Las contraseñas no coinciden.')
    }

    setLoading(true)
    try {
      const ColeccionUsuarios = collection(db, 'USUARIOS')

      const qEmail = query(ColeccionUsuarios, where('Email', '==', flowData.email))
      const snapEmail = await getDocs(qEmail)
      if (!snapEmail.empty) {
        setLoading(false)
        return setError('Este email ya se encuentra registrado.')
      }

      const nuevoDocRef = await addDoc(ColeccionUsuarios, {
        Nombre: flowData.email.split('@')[0],
        Email: flowData.email,
        Contraseña: contra,
        Fecha: new Date().toISOString(),
        Puntos: 0,
        Rango: 'Brote',
        DNI: 'N/A',
      })

      setUserDocId(nuevoDocRef.id)
      navigate('confirm-scan')
    } catch (err) {
      setError('Error al registrar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Crear contraseña" onBack={() => navigate('register-email')} />
      <ScrollView contentContainerClassName="flex-grow justify-between px-6 pb-8 pt-6">
        <View className="gap-4">
          <Text className="text-xs text-green-700 font-semibold bg-green-50 p-3 rounded-xl border border-green-200">
            Registrando cuenta para: {flowData?.email}
          </Text>

          <CampoInput
            label="Asignar contraseña"
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
            value={contra}
            onChangeText={(t) => { setError(''); setContra(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />

          <CampoInput
            label="Confirmar contraseña"
            secureTextEntry
            placeholder="Repetí tu contraseña"
            value={confirmContra}
            onChangeText={(t) => { setError(''); setConfirmContra(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />

          <MensajeError message={error} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 16 }} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCompletarRegistro}
            className="mt-8 h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
          >
            <Text className="font-semibold text-base text-white">Siguiente</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

// 4. INICIO SESIÓN - PASO 1: INGRESAR EMAIL O GOOGLE
export function PantallaLoginEmail() {
  const { navigate, setFlowData, flowData } = useApp()
  const [email, setEmail] = useState(flowData?.email || '')
  const [error, setError] = useState('')

  const handleSiguiente = () => {
    setError('')
    if (!email.trim()) {
      return setError('Ingresá tu dirección de email.')
    }
    setFlowData({ ...flowData, email: email.trim() })
    navigate('login-code')
  }

  const handleGoogleLogin = () => {
    // Simulación Login con Google
    navigate('home')
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Iniciar Sesión" onBack={() => navigate('welcome')} />
      <ScrollView contentContainerClassName="flex-grow justify-between px-6 pb-8 pt-6">
        <View className="gap-5">
          <Text className="text-sm text-gray-500 leading-relaxed">
            Ingresá tu email registrado para iniciar sesión en TeacherV2.
          </Text>

          <CampoInput
            label="Correo electrónico"
            placeholder="tu.email@escuela.uba.ar"
            value={email}
            onChangeText={(t) => { setError(''); setEmail(t); }}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={16} color="#16a34a" />}
          />

          <MensajeError message={error} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSiguiente}
            className="h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
          >
            <Text className="font-semibold text-base text-white">Siguiente</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400 font-medium">o iniciar sesión con</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <BotonGoogle label="Iniciar sesión con Google" onPress={handleGoogleLogin} />
        </View>

        <View className="flex-row items-center justify-center gap-1 mt-6">
          <Text className="text-sm text-gray-500">¿No tenés cuenta?</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('register-email')}>
            <Text className="text-sm font-bold text-green-600">Registrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

// 5. INICIO SESIÓN - PASO 2A: CÓDIGO DE VERIFICACIÓN (OTP)
export function PantallaLoginCode() {
  const { navigate, flowData, setPantallaActual, setUserDocId } = useApp()
  const [codigoIngresado, setCodigoIngresado] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState(false)

  // Función para generar un código único de 6 dígitos
  const generarNuevoCodigo = () => {
    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString()
    setCodigoGenerado(nuevoCodigo)
    return nuevoCodigo
  }

  // Se ejecuta al cargar la pantalla para enviar el código
  useEffect(() => {
    if (flowData?.email) {
      const codigo = generarNuevoCodigo()
      enviarCorreoConCodigo(flowData.email, codigo)
    }
  }, [flowData?.email])

  const enviarCorreoConCodigo = async (emailDestino, codigo) => {
    setEnviandoEmail(true)
    try {
      await emailjs.send(
        'service_zbwfi2e',  // Reemplazá por el Service ID del Paso 1 anterior
        'template_nsfs7b1',  // Reemplazá por el Template ID de esta plantilla
        { 
          to_email: emailDestino, 
          code: codigo 
        },
        { 
          publicKey: 'qPBhMhwXdDurztFHm' // Reemplazá por la Public Key de Cuenta
        }
      )
      
      console.log('¡Correo enviado con éxito!')
    } catch (err) {
      console.error('Error enviando mail con EmailJS:', err)
    } finally {
      setEnviandoEmail(false)
    }
  }
  const handleVerificarCodigo = async () => {
    setError('')

    // 1. VALIDACIÓN ESTRICTA DEL CÓDIGO
    if (!codigoIngresado || codigoIngresado.trim() !== codigoGenerado) {
      return setError('El código ingresado es incorrecto. Verificá e intentá de nuevo.')
    }

    setLoading(true)
    try {
      // 2. VERIFICACIÓN EN FIRESTORE
      const ColeccionUsuarios = collection(db, 'USUARIOS')
      const q = query(ColeccionUsuarios, where('Email', '==', flowData.email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('No existe una cuenta asociada a este correo.')
      } else {
        querySnapshot.forEach((docSnap) => {
          setUserDocId(docSnap.id)
        })
        setPantallaActual('home')
      }
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Código de verificación" onBack={() => navigate('login-email')} />
      <View className="flex-1 justify-between px-6 pb-8 pt-6">
        <View className="gap-5">
          <Text className="text-sm text-gray-500 leading-relaxed">
            Enviamos un código de confirmación de 6 dígitos a{' '}
            <Text className="font-semibold text-gray-800">{flowData?.email}</Text>
          </Text>

          <CampoInput
            label="Código de seguridad"
            placeholder="Ej: 849201"
            keyboardType="number-pad"
            maxLength={6}
            value={codigoIngresado}
            onChangeText={(t) => { setError(''); setCodigoIngresado(t); }}
            icon={<KeyRound size={16} color="#16a34a" />}
          />

          <MensajeError message={error} />

          {loading || enviandoEmail ? (
            <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 10 }} />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVerificarCodigo}
              className="h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
            >
              <Text className="font-semibold text-base text-white">Verificar e ingresar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const nuevo = generarNuevoCodigo()
              enviarCorreoConCodigo(flowData.email, nuevo)
            }}
            className="items-center py-2"
          >
            <Text className="text-xs font-semibold text-gray-500">
              ¿No recibiste el código? <Text className="text-green-600">Reenviar</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigate('login-password')}
            className="mt-2 items-center py-2"
          >
            <Text className="text-sm font-semibold text-green-600">
              o ingresar contraseña
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// 6. INICIO SESIÓN - PASO 2B: INGRESO DE CONTRASEÑA TRADICIONAL
export function PantallaLoginPassword() {
  const { navigate, flowData, setPantallaActual, setUserDocId } = useApp()
  const [contra, setContra] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginConContra = async () => {
    setError('')
    if (!contra) {
      return setError('Ingresá tu contraseña.')
    }

    setLoading(true)
    try {
      const ColeccionUsuarios = collection(db, 'USUARIOS')
      const q = query(ColeccionUsuarios, where('Email', '==', flowData.email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('El correo ingresado no está registrado.')
      } else {
        let encontrado = null
        querySnapshot.forEach((docSnap) => {
          if (docSnap.data().Contraseña === contra) {
            encontrado = docSnap.id
          }
        })

        if (encontrado) {
          setUserDocId(encontrado)
          setPantallaActual('home')
        } else {
          setError('Contraseña incorrecta.')
        }
      }
    } catch (err) {
      setError('Error al ingresar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Ingresar Contraseña" onBack={() => navigate('login-code')} />
      <ScrollView contentContainerClassName="flex-grow justify-between px-6 pb-8 pt-6">
        <View className="gap-4">
          <Text className="text-xs text-green-700 font-semibold bg-green-50 p-3 rounded-xl border border-green-200">
            Iniciando sesión con: {flowData?.email}
          </Text>

          <CampoInput
            label="Contraseña"
            secureTextEntry
            placeholder="••••••••"
            value={contra}
            onChangeText={(t) => { setError(''); setContra(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />

          <MensajeError message={error} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => alert('Próximamente opción de recuperar contraseña')}
            className="self-end"
          >
            <Text className="text-xs font-semibold text-green-600">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 10 }} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLoginConContra}
            className="mt-8 h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
          >
            <Text className="font-semibold text-base text-white">Ingresar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

// PANTALLAS PRINCIPALES DEL CLIENTE
export function PantallaHome() {
  const { userData, cerrarSesion, navigate } = useApp()
  const NombreUsuario = userData?.Nombre || 'Usuario'
  const PuntosActuales = Number(userData?.Puntos) || 0
  const RangoCalculado = getRangosParaPuntos(PuntosActuales)
  const ProximoRango = getProximoRango(PuntosActuales)
  const IconoRango = RangoCalculado.icon

  useEffect(() => {
    if (userData?.id && userData?.Rango !== RangoCalculado.name) {
      const usuarioRef = doc(db, 'USUARIOS', userData.id)
      updateDoc(usuarioRef, {
        Rango: RangoCalculado.name,
      }).catch((err) => console.error('Error al actualizar rango en Firestore:', err))
    }
  }, [PuntosActuales, userData?.id, userData?.Rango, RangoCalculado.name])

  const Progreso = ProximoRango
    ? Math.min(
        100,
        Math.round(((PuntosActuales - RangoCalculado.min) / (ProximoRango.min - RangoCalculado.min)) * 100),
      )
    : 100
  const faltan = ProximoRango ? ProximoRango.min - PuntosActuales : 0

  return (
    <View className="flex-1 bg-green-50/30">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-6">
        <View className="flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-xs font-medium uppercase tracking-wider text-green-700">
              Bienvenido
            </Text>
            <Text className="text-xl font-bold tracking-tight text-gray-900">
              @{NombreUsuario}
            </Text>
          </View>
          <View className="rounded-2xl bg-green-100 p-2 border border-green-200">
            <TeacherV2Logo size={36} />
          </View>
        </View>

        <View className="relative overflow-hidden rounded-3xl bg-green-600 p-6 shadow-md">
          <View className="absolute -right-6 -top-6">
            <Recycle size={176} color="#FFFFFF" opacity={0.15} />
          </View>

          <View className="relative z-10 justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Tus puntos
              </Text>
              <Text className="mt-1 text-5xl font-extrabold tracking-tight text-white">
                {PuntosActuales.toLocaleString('es-AR')}
              </Text>

              <View className="mt-4 flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 self-start">
                <IconoRango size={14} color="#FFF" />
                <Text className="text-xs font-medium text-white">
                  Rango {userData?.Rango || RangoCalculado.name}
                </Text>
              </View>
            </View>

            <View className="mt-6 gap-2">
              <View className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <View
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${Progreso}%` }}
                />
              </View>
              <Text className="text-xs text-green-100">
                {ProximoRango
                  ? `Te faltan ${faltan.toLocaleString('es-AR')} puntos para llegar a ${ProximoRango.name}`
                  : '¡Alcanzaste el rango máximo! 🌳'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigate('Placeholder: Sección de Canjes')}
              className="mt-6 h-12 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-white shadow-xs"
            >
              <Gift size={18} color="#16a34a" />
              <Text className="font-semibold text-green-600">Ir a canjes</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigate('Placeholder: Historial de Reciclajes')}
          className="flex-row items-center justify-between rounded-2xl border border-green-200 bg-white p-4 shadow-xs"
        >
          <View className="flex-row items-center gap-3.5">
            <View className="size-11 items-center justify-center rounded-xl bg-green-100">
              <Leaf size={20} color="#16a34a" />
            </View>
            <View>
              <Text className="font-semibold text-gray-900 text-sm">
                Historial de reciclajes
              </Text>
              <Text className="text-xs text-gray-500">Ver tu actividad</Text>
            </View>
          </View>
          <ArrowRight size={16} color="#16a34a" />
        </TouchableOpacity>

        <View className="rounded-3xl border border-green-200 bg-green-100/50 p-5">
          <View className="flex-row items-center gap-2">
            <Info size={16} color="#16a34a" />
            <Text className="font-bold text-sm tracking-tight text-green-800">
              ¿Por qué TeacherV2?
            </Text>
          </View>
          <Text className="mt-2 text-xs leading-relaxed text-gray-600">
            Convertimos el reciclaje en recompensas reales para que cada botella,
            lata o papel que reciclás tenga un impacto positivo en tu escuela y en el planeta.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={cerrarSesion}
            className="mt-4 rounded-xl border border-green-300 bg-white px-4 py-2 self-start"
          >
            <Text className="text-xs font-medium text-green-700">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BarraDeNavegacion
        activeTab="home"
        onTabPress={(id, label) => {
          if (id === 'home') navigate('home')
          else navigate(`Placeholder: ${label}`)
        }}
      />
    </View>
  )
}

export function PantallaConfirmacionEscanearDNI() {
  const { navigate } = useApp()

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Verificá tu identidad" onBack={() => navigate('welcome')} />
      <ScrollView contentContainerClassName="flex-grow px-6 pb-8 pt-6 justify-between">
        <View>
          <View className="self-center size-20 items-center justify-center rounded-3xl bg-green-100 border border-green-200 shadow-xs">
            <IdCard size={40} strokeWidth={1.75} color="#16a34a" />
          </View>

          <Text className="mt-6 text-center text-xl font-bold tracking-tight text-gray-900">
            Vamos a escanear tu documento
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
            Necesitamos leer el código de barras de tu DNI para vincular tus
            reciclajes a tu cuenta. Así sabemos a quién sumarle los puntos en la caja.
          </Text>

          <View className="mt-8 gap-3">
            {[
              {
                icon: ScanLine,
                text: 'Escaneamos únicamente el código de barras del DNI.',
              },
              {
                icon: ShieldCheck,
                text: 'Tus datos se usan solo para identificarte al reciclar.',
              },
            ].map(({ icon: Icon, text }) => (
              <View
                key={text}
                className="flex-row items-center gap-3.5 rounded-2xl border border-green-100 bg-green-50/50 p-4 shadow-xs"
              >
                <View className="size-10 items-center justify-center rounded-xl bg-green-100">
                  <Icon size={20} color="#16a34a" />
                </View>
                <Text className="flex-1 text-xs text-gray-600 leading-snug">
                  {text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigate('home')}
          className="mt-8 h-12 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-green-600 shadow-xs"
        >
          <ScanLine size={20} color="#FFF" />
          <Text className="font-semibold text-base text-white">
            Escanear documento
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export function PantallaEnDesarrollo({ seccion }) {
  const { navigate } = useApp()

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-3">
        En Desarrollo
      </Text>
      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
        {seccion}
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        Esta sección no está implementada todavía.
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigate('home')}
        className="h-12 px-6 items-center justify-center rounded-2xl bg-green-600 shadow-xs"
      >
        <Text className="font-semibold text-base text-white">
          Volver a Inicio
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// PANTALLA PRINCIPAL
export default function PantallaActual() {
  const [pantallaActual, setPantallaActual] = useState('welcome')
  const [userData, setUserData] = useState(null)
  const [flowData, setFlowData] = useState({})
  const [SeccionTemporal, setSeccionTemporal] = useState('')
  const [userDocId, setUserDocId] = useState(null)

  // ESCUCHADOR EN TIEMPO REAL DE FIRESTORE
  useEffect(() => {
    if (!userDocId) {
      setUserData(null)
      return
    }

    const userRef = doc(db, 'USUARIOS', userDocId)

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData({ id: docSnap.id, ...docSnap.data() })
        }
      },
      (error) => {
        console.error('Error escuchando cambios en tiempo real:', error)
      }
    )

    return () => unsubscribe()
  }, [userDocId])

  const navigate = (pantalla) => {
    if (pantalla.startsWith('Placeholder:')) {
      setSeccionTemporal(pantalla.replace('Placeholder:', '').trim())
      setPantallaActual('placeholder')
    } else {
      setPantallaActual(pantalla)
    }
  }

  const cerrarSesion = () => {
    setUserDocId(null)
    setUserData(null)
    setFlowData({})
    setPantallaActual('welcome')
  }

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        setUserDocId,
        flowData,
        setFlowData,
        cerrarSesion,
        navigate,
        setPantallaActual,
      }}
    >
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />
          {pantallaActual === 'welcome' && <PantallaWelcome />}
          {pantallaActual === 'register-email' && <PantallaRegisterEmail />}
          {pantallaActual === 'register-password' && <PantallaRegisterPassword />}
          {pantallaActual === 'login-email' && <PantallaLoginEmail />}
          {pantallaActual === 'login-code' && <PantallaLoginCode />}
          {pantallaActual === 'login-password' && <PantallaLoginPassword />}
          {pantallaActual === 'home' && <PantallaHome />}
          {pantallaActual === 'confirm-scan' && <PantallaConfirmacionEscanearDNI />}
          {pantallaActual === 'placeholder' && <PantallaEnDesarrollo seccion={SeccionTemporal} />}
        </SafeAreaView>
      </SafeAreaProvider>
    </AppContext.Provider>
  )
}