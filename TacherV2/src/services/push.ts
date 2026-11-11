import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { db } from 'src/firebase'
import type { Pantalla } from 'src/types'

/**
 * Notificaciones push con Expo.
 * El token de cada teléfono se guarda en USUARIOS/{uid}.ExpoPushTokens (un usuario puede
 * tener varios dispositivos). El backend de la caja y la app del cajero leen ese campo para
 * mandar el push, con `data: { pantalla: 'notificaciones' }` para saber qué abrir al tocarlo.
 */

/** Mismo id que usan el backend y el cajero al enviar (`channelId`). */
export const CANAL_ANDROID = 'default'

/** Pantallas que puede abrir un push. Cualquier otro valor se ignora. */
const DESTINOS_PERMITIDOS: Pantalla[] = ['notificaciones', 'home']
const DESTINO_POR_DEFECTO: Pantalla = 'notificaciones'

let tokenRegistrado: string | null = null

/** Con la app abierta, el push igual se muestra como banner. */
export function configurarNotificaciones() {
  if (Platform.OS === 'web') return

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Reciclajes y canjes',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#268257',
    }).catch((error) => console.error('No se pudo crear el canal de notificaciones:', error))
  }
}

async function obtenerTokenExpo(): Promise<string | null> {
  if (Platform.OS === 'web') return null

  const permisos = await Notifications.getPermissionsAsync()
  let concedido = permisos.granted
  if (!concedido && permisos.canAskAgain) {
    concedido = (await Notifications.requestPermissionsAsync()).granted
  }
  if (!concedido) return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  return data
}

/** Pide permiso (la primera vez) y asocia este teléfono al usuario. Nunca lanza errores. */
export async function registrarDispositivoParaPush(uid: string): Promise<void> {
  try {
    const token = await obtenerTokenExpo()
    if (!token) return
    await updateDoc(doc(db, 'USUARIOS', uid), { ExpoPushTokens: arrayUnion(token) })
    tokenRegistrado = token
  } catch (error) {
    // En emulador o sin credenciales de FCM falla: la app funciona igual, solo sin push
    console.error('No se pudo registrar el dispositivo para notificaciones push:', error)
  }
}

/** Al cerrar sesión: este teléfono deja de recibir los push de esa cuenta. Llamar ANTES de signOut. */
export async function quitarDispositivoDePush(uid: string): Promise<void> {
  const token = tokenRegistrado
  if (!token) return
  tokenRegistrado = null
  try {
    await updateDoc(doc(db, 'USUARIOS', uid), { ExpoPushTokens: arrayRemove(token) })
  } catch (error) {
    console.error('No se pudo quitar el dispositivo de las notificaciones push:', error)
  }
}

/** Qué pantalla abrir cuando el usuario toca un push. null = ninguna (por ejemplo, si lo descartó). */
export function destinoDeRespuesta(respuesta: Notifications.NotificationResponse): Pantalla | null {
  if (respuesta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return null
  const pedido = respuesta.notification.request.content.data?.pantalla
  return DESTINOS_PERMITIDOS.includes(pedido as Pantalla) ? (pedido as Pantalla) : DESTINO_POR_DEFECTO
}
