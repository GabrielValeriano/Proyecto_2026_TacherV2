// notificaciones.js
// Guarda una notificación en USUARIOS/{uid}/NOTIFICACIONES y la manda como push a los
// teléfonos del usuario (campo USUARIOS/{uid}.ExpoPushTokens, que registra la app).
const { FieldValue } = require('firebase-admin/firestore');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/** Envía el push con la API de Expo. Devuelve los tokens que ya no sirven (app desinstalada, etc.). */
async function enviarPush(tokens, { titulo, mensaje }) {
  if (!tokens.length) return [];

  const mensajes = tokens.map((to) => ({
    to,
    title: titulo,
    body: mensaje,
    sound: 'default',
    channelId: 'default', // mismo canal que crea la app en Android
    data: { pantalla: 'notificaciones' }, // la app abre esta pantalla al tocar el push
  }));

  const respuesta = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(mensajes),
  });
  if (!respuesta.ok) throw new Error(`Expo push respondió ${respuesta.status}`);

  const { data = [] } = await respuesta.json();
  return data
    .map((ticket, i) => (ticket.details?.error === 'DeviceNotRegistered' ? tokens[i] : null))
    .filter(Boolean);
}

/**
 * Crea la notificación y manda el push. Nunca lanza: si falla, el reciclaje ya quedó
 * registrado y no queremos que la caja lo informe como error.
 */
async function notificarUsuario(db, usuarioRef, usuarioData, { tipo, titulo, mensaje }) {
  try {
    await usuarioRef.collection('NOTIFICACIONES').add({
      Tipo: tipo,
      Titulo: titulo,
      Mensaje: mensaje,
      Fecha: FieldValue.serverTimestamp(),
      Leida: false,
    });

    const tokens = Array.isArray(usuarioData.ExpoPushTokens) ? usuarioData.ExpoPushTokens : [];
    const invalidos = await enviarPush(tokens, { titulo, mensaje });
    if (invalidos.length) {
      await usuarioRef.update({ ExpoPushTokens: FieldValue.arrayRemove(...invalidos) });
    }
  } catch (error) {
    console.error('Error al notificar al usuario:', error);
  }
}

module.exports = { notificarUsuario };
