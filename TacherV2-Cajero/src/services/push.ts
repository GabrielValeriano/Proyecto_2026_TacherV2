const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface Aviso {
  titulo: string
  mensaje: string
}

/**
 * Manda un push a los teléfonos del cliente con la API de Expo.
 * `data.pantalla` le dice a la app del cliente qué pantalla abrir al tocarlo.
 * Nunca lanza: el canje ya quedó hecho aunque el push falle.
 */
export async function enviarPush(tokens: string[], { titulo, mensaje }: Aviso): Promise<void> {
  if (tokens.length === 0) return
  try {
    const respuesta = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(
        tokens.map((to) => ({
          to,
          title: titulo,
          body: mensaje,
          sound: 'default',
          channelId: 'default',
          data: { pantalla: 'notificaciones' },
        })),
      ),
    })
    if (!respuesta.ok) console.error('Expo push respondió', respuesta.status)
  } catch (error) {
    console.error('No se pudo enviar el push al cliente:', error)
  }
}
