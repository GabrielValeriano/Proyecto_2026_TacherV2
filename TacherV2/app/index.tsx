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
  onSnapshot,
  doc
} from 'firebase/firestore'
import { db } from 'src/firebase' // Tu configuración de Firebase


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


// COMPONENTES SECUNDARIOS DE TACHERV2

function TacherV2Logo({ size = 36, withWordmark = false }) {
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

// BARRA DE NAVEGACIÓN INFERIOR
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


// PANTALLAS DE LA APLICACIÓN

export function PantallaHome() {
  const { userData, cerrarSesion, navigate } = useApp()
  const NombreUsuario = userData?.Nombre || 'Usuario'
  const PuntosActuales = userData?.Puntos || 0
  const RangoActual = getRangosParaPuntos(PuntosActuales)
  const ProximoRango = getProximoRango(PuntosActuales)
  const IconoRango = RangoActual.icon

  const Progreso = ProximoRango
    ? Math.min(
        100,
        Math.round(((PuntosActuales - RangoActual.min) / (ProximoRango.min - RangoActual.min)) * 100),
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
            <TacherV2Logo size={36} />
          </View>
        </View>

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
                {PuntosActuales.toLocaleString('es-AR')}
              </Text>

              <View className="mt-4 flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 self-start">
                <IconoRango size={14} color="#FFF" />
                <Text className="text-xs font-medium text-white">
                  Rango {userData?.Rango || RangoActual.name}
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

export function PantallaRegister() {
  const { navigate, setPantallaActual } = useApp()
  const [RegistroEmail, setRegistroEmail] = useState('')
  const [RegistroNombreUsuario, setRegistroNombreUsuario] = useState('')
  const [RegistroContraseña, setRegistroContraseña] = useState('')
  const [RegistroConfirmarContra, setRegistroConfirmacionContra] = useState('')
  const [ErrorRegistro, setErrorRegistro] = useState('')
  const [Loading, setLoading] = useState(false)

  const EjecutarRegistro = async () => {
    setErrorRegistro('')

    if (!RegistroEmail || !RegistroNombreUsuario || !RegistroContraseña || !RegistroConfirmarContra) {
      return setErrorRegistro('Todos los campos son obligatorios.')
    }

    if (RegistroContraseña !== RegistroConfirmarContra) {
      return setErrorRegistro('Las contraseñas no coinciden.')
    }

    setLoading(true)
    try {
      const ColeccionUsuarios = collection(db, 'USUARIOS')

      const qNombreUsuario = query(ColeccionUsuarios, where('Nombre', '==', RegistroNombreUsuario.trim()))
      const snapUser = await getDocs(qNombreUsuario)
      if (!snapUser.empty) {
        setLoading(false)
        return setErrorRegistro('Este nombre de usuario ya existe.')
      }

      const qEmail = query(ColeccionUsuarios, where('Email', '==', RegistroEmail.trim()))
      const snapEmail = await getDocs(qEmail)
      if (!snapEmail.empty) {
        setLoading(false)
        return setErrorRegistro('Este email ya se encuentra registrado.')
      }

      await addDoc(ColeccionUsuarios, {
        Nombre: RegistroNombreUsuario.trim(),
        Email: RegistroEmail.trim(),
        Contraseña: RegistroContraseña,
        Fecha: new Date().toISOString(),
        Puntos: 0,
        Rango: 'Brote',
        DNI: 'N/A',
      })

      setRegistroEmail('')
      setRegistroNombreUsuario('')
      setRegistroContraseña('')
      setRegistroConfirmacionContra('')
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

          <CampoInput
            label="Correo electronico"
            keyboardType="email-address"
            placeholder="nombre@escuela.uba.ar"
            value={RegistroEmail}
            onChangeText={(t) => { setErrorRegistro(''); setRegistroEmail(t); }}
            autoCapitalize="none"
            icon={<Mail size={16} color="#16a34a" />}
          />
          <CampoInput
            label="Nombre de usuario"
            placeholder="tu.usuario"
            value={RegistroNombreUsuario}
            onChangeText={(t) => { setErrorRegistro(''); setRegistroNombreUsuario(t); }}
            autoCapitalize="none"
            icon={<AtSign size={16} color="#16a34a" />}
          />
          <CampoInput
            label="Contraseña"
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
            value={RegistroContraseña}
            onChangeText={(t) => { setErrorRegistro(''); setRegistroContraseña(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />
          <CampoInput
            label="Verificar contraseña"
            secureTextEntry
            placeholder="Repetí tu contraseña"
            value={RegistroConfirmarContra}
            onChangeText={(t) => { setErrorRegistro(''); setRegistroConfirmacionContra(t); }}
            icon={<Lock size={16} color="#16a34a" />}
          />

          <MensajeError message={ErrorRegistro} />
        </View>

        {Loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 16 }} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={EjecutarRegistro}
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

export function PantallaLogin() {
  const { navigate, setPantallaActual, setUserDocId } = useApp()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginContraseña, setLoginPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [loading, setLoading] = useState(false)

  const ejecutarLogin = async () => {
    setErrorLogin('')

    if (!loginEmail || !loginContraseña) {
      return setErrorLogin('Completá el email y la contraseña')
    }

    setLoading(true)
    try {
      const ColeccionUsuarios = collection(db, 'USUARIOS')
      const q = query(ColeccionUsuarios, where('Email', '==', loginEmail.trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setErrorLogin('El email ingresado no existe en la base de datos.')
      } 
      else {
        let usuarioEncontrado = null
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.Contraseña === loginContraseña) {
            usuarioEncontrado = docSnap.id
          }
        });

        if (usuarioEncontrado) {
          const { setUserDocId, setPantallaActual } = useApp // obtenemos el setter
          setUserDocId(usuarioEncontrado)
          setPantallaActual('home')
        } else {
          setErrorLogin('Contraseña incorrecta')
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
          <TacherV2Logo size={56} withWordmark />
        </View>
        <View className="items-center gap-1.5">
          <Text className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Reciclar Con Un Proposito
          </Text>
          <Text className="text-sm text-gray-500 leading-relaxed text-center">
            Ingresá a tu cuenta para ver tus puntos y canjearlos por productos reales del kiosco.
          </Text>
        </View>
      </View>

      <View className="mt-8 gap-4">
        <CampoInput
          label="Cuenta (Email)"
          placeholder="tu.email@escuela.uba.ar"
          value={loginEmail}
          onChangeText={(t) => { setErrorLogin(''); setLoginEmail(t); }}
          autoCapitalize="none"
          keyboardType="email-address"
          icon={<Mail size={16} color="#16a34a" />}
        />
        <CampoInput
          label="Contraseña"
          secureTextEntry
          placeholder="••••••••"
          value={loginContraseña}
          onChangeText={(t) => { setErrorLogin(''); setLoginPassword(t); }}
          icon={<Lock size={16} color="#16a34a" />}
        />

        <MensajeError message={errorLogin} />

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

export function PantallaConfirmacionEscanearDNI() {
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

// PANTALLA EN DESARROLLO

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
  const [pantallaActual, setPantallaActual] = useState('login')
  const [userData, setUserData] = useState(null)
  const [SeccionTemporal, setSeccionTemporal] = useState('')
  const [userDocId, setUserDocId] = useState(null) // Guardamos el ID del documento

  // ESCUCHADOR EN TIEMPO REAL DE FIRESTORE
  useEffect(() => {
    // Si no hay un usuario logueado, no escuchamos nada
    if (!userDocId) {
      setUserData(null)
      return
    }

    // Creamos la referencia directa al documento del usuario
    const userRef = doc(db, 'USUARIOS', userDocId)

    // onSnapshot escucha cualquier cambio en vivo
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        // Actualiza el estado de la app automáticamente cuando cambia algo en la BD
        setUserData({ id: docSnap.id, ...docSnap.data() })
      }
    }, (error) => {
      console.error("Error escuchando cambios en tiempo real:", error)
    })

    // Limpiamos la suscripción cuando se cierra sesión o cambia el usuario
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
    setPantallaActual('login')
  }

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        setUserDocId,
        cerrarSesion,
        navigate,
        setPantallaActual,
      }}
    >
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />
          {pantallaActual === 'login' && <PantallaLogin />}
          {pantallaActual === 'register' && <PantallaRegister />}
          {pantallaActual === 'home' && <PantallaHome />}
          {pantallaActual === 'confirm-scan' && <PantallaConfirmacionEscanearDNI />}
          {pantallaActual === 'placeholder' && <PantallaEnDesarrollo seccion={SeccionTemporal} />}
        </SafeAreaView>
      </SafeAreaProvider>
    </AppContext.Provider>
  )
}