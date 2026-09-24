import React, { useState, createContext, useContext } from 'react'
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
  AtSign,
  ScanLine,
  ShieldCheck,
  IdCard,
  ChevronLeft,
  Award,
  Zap,
  Home,
  User,
} from 'lucide-react-native'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore'
import { db } from 'src/firebase' // Tu configuración de Firebase

// ==========================================
// 1. LÓGICA DE RANGOS
// ==========================================
const RANKS = [
  { name: 'Plata', min: 0, icon: Leaf },
  { name: 'Bronce', min: 500, icon: Zap },
  { name: 'Oro', min: 2000, icon: Award },
]

function getRankForPoints(points = 0) {
  let currentRank = RANKS[0]
  for (const r of RANKS) {
    if (points >= r.min) currentRank = r
  }
  return currentRank
}

function getNextRank(points = 0) {
  for (const r of RANKS) {
    if (points < r.min) return r
  }
  return null
}

// ==========================================
// 2. CONTEXTO DE APLICACIÓN
// ==========================================
const AppContext = createContext(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider')
  return context
}

// ==========================================
// 3. COMPONENTES DE UI AUXILIARES
// ==========================================
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

function ScreenHeader({ title, onBack }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
      {onBack && (
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} className="p-1">
          <ChevronLeft size={24} color="#16a34a" />
        </TouchableOpacity>
      )}
      <Text className="text-base font-bold text-green-700">{title}</Text>
    </View>
  )
}

function TextField({ label, icon, value, onChangeText, error, ...props }) {
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

function ErrorBox({ message }) {
  if (!message) return null
  return (
    <View className="my-2 rounded-2xl border border-red-300 bg-red-50 p-3">
      <Text className="text-center text-xs font-medium text-red-600">
        ⚠️ {message}
      </Text>
    </View>
  )
}

// BARRA DE NAVEGACIÓN INFERIOR (TAB BAR)
function BottomNavBar({ activeTab, onTabPress }) {
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

// ==========================================
// 4. PANTALLAS DE LA APLICACIÓN
// ==========================================

export function HomeScreen() {
  const { userData, navigate } = useApp()
  const username = userData?.Nombre || 'Usuario'
  const points = userData?.Puntos || 0
  const rank = getRankForPoints(points)
  const next = getNextRank(points)
  const RankIcon = rank.icon

  const progress = next
    ? Math.min(
        100,
        Math.round(((points - rank.min) / (next.min - rank.min)) * 100),
      )
    : 100
  const faltan = next ? next.min - points : 0

  return (
    <View className="flex-1 bg-green-50/30">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-6">
        <View className="flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-xs font-medium uppercase tracking-wider text-green-700">
              Hola de nuevo
            </Text>
            <Text className="text-xl font-bold tracking-tight text-gray-900">
              @{username}
            </Text>
          </View>
          <View className="rounded-2xl bg-green-100 p-2 border border-green-200">
            <TeacherV2Logo size={36} />
          </View>
        </View>

        {/* Hero de Puntos - Verde Primario */}
        <View className="relative overflow-hidden rounded-3xl bg-green-600 p-6 shadow-md">
          <View className="absolute -right-6 -top-6">
            <Recycle size={176} color="rgba(255,255,255,0.15)" />
          </View>

          <View className="relative z-10 justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Tus puntos
              </Text>
              <Text className="mt-1 text-5xl font-extrabold tracking-tight text-white">
                {points.toLocaleString('es-AR')}
              </Text>

              <View className="mt-4 flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 self-start">
                <RankIcon size={14} color="#FFF" />
                <Text className="text-xs font-medium text-white">
                  Rango {userData?.Rango || rank.name}
                </Text>
              </View>
            </View>

            <View className="mt-6 gap-2">
              <View className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <View
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-xs text-green-100">
                {next
                  ? `Te faltan ${faltan.toLocaleString('es-AR')} puntos para llegar a ${next.name}`
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
            onPress={() => navigate('login')}
            className="mt-4 rounded-xl border border-green-300 bg-white px-4 py-2 self-start"
          >
            <Text className="text-xs font-medium text-green-700">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de pestañas en la parte inferior */}
      <BottomNavBar
        activeTab="home"
        onTabPress={(id, label) => {
          if (id === 'home') navigate('home')
          else navigate(`Placeholder: ${label}`)
        }}
      />
    </View>
  )
}

export function RegisterScreen() {
  const { navigate, setPantallaActual } = useApp()
  const [regEmail, setRegEmail] = useState('')
  const [regUsuario, setRegUsuario] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPass, setRegConfirmPass] = useState('')
  const [errorRegistro, setErrorRegistro] = useState('')
  const [loading, setLoading] = useState(false)

  const ejecutarRegistro = async () => {
    setErrorRegistro('')

    if (!regEmail || !regUsuario || !regPassword || !regConfirmPass) {
      return setErrorRegistro('Todos los campos son obligatorios.')
    }

    if (regPassword !== regConfirmPass) {
      return setErrorRegistro('Las contraseñas no coinciden.')
    }

    setLoading(true)
    try {
      const usuariosRef = collection(db, 'USUARIOS')

      const qUser = query(usuariosRef, where('Nombre', '==', regUsuario.trim()))
      const snapUser = await getDocs(qUser)
      if (!snapUser.empty) {
        setLoading(false)
        return setErrorRegistro('Este nombre de usuario ya existe.')
      }

      const qEmail = query(usuariosRef, where('Email', '==', regEmail.trim()))
      const snapEmail = await getDocs(qEmail)
      if (!snapEmail.empty) {
        setLoading(false)
        return setErrorRegistro('Este email ya se encuentra registrado.')
      }

      await addDoc(usuariosRef, {
        Nombre: regUsuario.trim(),
        Email: regEmail.trim(),
        Contraseña: regPassword,
        Fecha: new Date().toISOString(),
        Puntos: 0,
        Rango: 'Plata',
        DNI: 'N/A',
      })

      setRegEmail('')
      setRegUsuario('')
      setRegPassword('')
      setRegConfirmPass('')
      setPantallaActual('confirm-scan')
    } catch (err) {
      setErrorRegistro('Error al registrar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Crear cuenta" onBack={() => navigate('login')} />
      <ScrollView contentContainerClassName="flex-grow px-6 pb-8 pt-4 justify-between">
        <View className="gap-4">
          <Text className="text-sm text-gray-500 leading-relaxed">
            Creá tu cuenta de TeacherV2 para empezar a sumar puntos por cada reciclaje.
          </Text>

          <TextField
            label="Correo institucional"
            keyboardType="email-address"
            placeholder="nombre@escuela.uba.ar"
            value={regEmail}
            onChangeText={(t) => { setErrorRegistro(''); setRegEmail(t); }}
            autoCapitalize="none"
            icon={<Mail size={16} color="#16a34a" />}
          />
          <TextField
            label="Nombre de usuario"
            placeholder="tu.usuario"
            value={regUsuario}
            onChangeText={(t) => { setErrorRegistro(''); setRegUsuario(t); }}
            autoCapitalize="none"
            icon={<AtSign size={16} color="#16a34a" />}
          />
          <TextField
            label="Contraseña"
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
            value={regPassword}
            onChangeText={(t) => { setErrorRegistro(''); setRegPassword(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />
          <TextField
            label="Verificar contraseña"
            secureTextEntry
            placeholder="Repetí tu contraseña"
            value={regConfirmPass}
            onChangeText={(t) => { setErrorRegistro(''); setRegConfirmPass(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />

          <ErrorBox message={errorRegistro} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 16 }} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={ejecutarRegistro}
            className="mt-8 h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
          >
            <Text className="font-semibold text-base text-white">
              Siguiente
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

export function LoginScreen() {
  const { navigate, setPantallaActual, setUserData } = useApp()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [loading, setLoading] = useState(false)

  const ejecutarLogin = async () => {
    setErrorLogin('')

    if (!loginEmail || !loginPassword) {
      return setErrorLogin('Completá el email y la contraseña.')
    }

    setLoading(true)
    try {
      const usuariosRef = collection(db, 'USUARIOS')
      const q = query(usuariosRef, where('Email', '==', loginEmail.trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setErrorLogin('El email ingresado no existe en la base de datos.')
      } else {
        let usuarioEncontrado = null
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.Contraseña === loginPassword) {
            usuarioEncontrado = { id: docSnap.id, ...data }
          }
        });

        if (usuarioEncontrado) {
          setUserData(usuarioEncontrado)
          setPantallaActual('home')
        } else {
          setErrorLogin('Contraseña incorrecta.')
        }
      }
    } catch (err) {
      setErrorLogin('Error de conexión: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerClassName="flex-grow justify-between px-6 pb-8 pt-12 bg-white">
      <View className="items-center gap-6">
        <View className="rounded-3xl bg-green-50 p-4 border border-green-200">
          <TeacherV2Logo size={56} withWordmark />
        </View>
        <View className="items-center gap-1.5">
          <Text className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Reciclá. Sumá puntos. Canjeá.
          </Text>
          <Text className="text-sm text-gray-500 leading-relaxed text-center">
            Ingresá a tu cuenta para ver tus puntos y canjearlos por productos reales del kiosco.
          </Text>
        </View>
      </View>

      <View className="mt-8 gap-4">
        <TextField
          label="Cuenta (Email)"
          placeholder="tu.email@escuela.uba.ar"
          value={loginEmail}
          onChangeText={(t) => { setErrorLogin(''); setLoginEmail(t); }}
          autoCapitalize="none"
          keyboardType="email-address"
          icon={<Mail size={16} color="#16a34a" />}
        />
        <TextField
          label="Contraseña"
          secureTextEntry
          placeholder="••••••••"
          value={loginPassword}
          onChangeText={(t) => { setErrorLogin(''); setLoginPassword(t); }}
          icon={<Lock size={16} color="#16a34a" />}
        />

        <ErrorBox message={errorLogin} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigate('Placeholder: Recuperación de contraseña')}
          className="self-end"
        >
          <Text className="text-xs font-semibold text-green-600">
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 10 }} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={ejecutarLogin}
            className="mt-2 h-12 w-full items-center justify-center rounded-2xl bg-green-600 shadow-xs"
          >
            <Text className="font-semibold text-base text-white">
              Ingresar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-gray-500">¿No tenés cuenta?</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('register')}>
          <Text className="text-sm font-bold text-green-600">Registrate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export function ConfirmScanScreen() {
  const { navigate } = useApp()

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Verificá tu identidad" onBack={() => navigate('login')} />
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
          onPress={() => navigate('Placeholder: Escáner de Cámara')}
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

export function PlaceholderScreen({ seccion }) {
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

// ==========================================
// 5. APPLICACIÓN PRINCIPAL (ENTRY POINT)
// ==========================================
export default function IndexScreen() {
  const [pantallaActual, setPantallaActual] = useState('login')
  const [userData, setUserData] = useState(null)
  const [seccionTemporal, setSeccionTemporal] = useState('')

  const navigate = (screen) => {
    if (screen.startsWith('Placeholder:')) {
      setSeccionTemporal(screen.replace('Placeholder:', '').trim())
      setPantallaActual('placeholder')
    } else {
      setPantallaActual(screen)
    }
  }

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        navigate,
        setPantallaActual,
      }}
    >
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />
          {pantallaActual === 'login' && <LoginScreen />}
          {pantallaActual === 'register' && <RegisterScreen />}
          {pantallaActual === 'home' && <HomeScreen />}
          {pantallaActual === 'confirm-scan' && <ConfirmScanScreen />}
          {pantallaActual === 'placeholder' && <PlaceholderScreen seccion={seccionTemporal} />}
        </SafeAreaView>
      </SafeAreaProvider>
    </AppContext.Provider>
  )
}