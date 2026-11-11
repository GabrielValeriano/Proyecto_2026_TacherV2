// recuperacion.js
// Recuperación de contraseña con un código de 8 dígitos enviado por mail.
//
//   POST /api/recuperacion/solicitar  { email }                   -> manda el código
//   POST /api/recuperacion/verificar  { email, codigo }           -> { token } si el código es correcto
//   POST /api/recuperacion/cambiar    { email, token, password }  -> cambia la contraseña en Firebase Auth
//
// El código nunca sale del servidor salvo por mail. En Firestore (RECUPERACIONES) se guarda
// solo su hash, con vencimiento y cantidad de intentos.
const crypto = require('crypto');
const { getAuth } = require('firebase-admin/auth');
const { Timestamp } = require('firebase-admin/firestore');

const MINUTOS_VALIDEZ_CODIGO = 10;
const MINUTOS_VALIDEZ_TOKEN = 10;
const SEGUNDOS_ENTRE_ENVIOS = 60;
const INTENTOS_MAXIMOS = 5;
const LARGO_MINIMO_PASSWORD = 8;

// Mismos datos de EmailJS que usa la app (src/config.ts). Se pueden cambiar desde el .env.
const EMAILJS = {
  url: 'https://api.emailjs.com/api/v1.0/email/send',
  serviceId: process.env.EMAILJS_SERVICE_ID || 'service_zbwfi2e',
  templateId: process.env.EMAILJS_TEMPLATE_RECUPERACION || 'template_nsfs7b1',
  publicKey: process.env.EMAILJS_PUBLIC_KEY || 'qPBhMhwXdDurztFHm',
};

const hash = (texto) => crypto.createHash('sha256').update(texto).digest('hex');
const normalizarEmail = (email) => String(email || '').trim().toLowerCase();
const generarCodigo = () => crypto.randomInt(0, 100000000).toString().padStart(8, '0');

function igualesSeguro(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const error = (res, status, mensaje) => res.status(status).json({ exito: false, mensaje });

async function enviarMailConCodigo(email, codigo) {
  const respuesta = await fetch(EMAILJS.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost' },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.templateId,
      user_id: EMAILJS.publicKey,
      ...(process.env.EMAILJS_PRIVATE_KEY ? { accessToken: process.env.EMAILJS_PRIVATE_KEY } : {}),
      template_params: { to_email: email, code: codigo },
    }),
  });
  if (!respuesta.ok) {
    throw new Error(`EmailJS respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
}

/**
 * ¿La contraseña nueva es la misma que la actual? Firebase no deja leer contraseñas,
 * así que probamos iniciar sesión con ella (API REST de Auth, con la API key web).
 * Devuelve true / false, o null si no se pudo comprobar.
 */
async function esLaContrasenaActual(email, password) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    console.warn('Falta FIREBASE_WEB_API_KEY en el .env: no se puede comprobar la contraseña anterior.');
    return null;
  }
  const respuesta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    },
  );
  if (respuesta.ok) return true;

  const { error: detalle } = await respuesta.json().catch(() => ({}));
  const codigo = String(detalle?.message || '');
  if (['INVALID_PASSWORD', 'INVALID_LOGIN_CREDENTIALS'].some((c) => codigo.startsWith(c))) return false;
  console.error('No se pudo comprobar la contraseña anterior:', codigo || respuesta.status);
  return null;
}

function registrarRutasRecuperacion(app, db) {
  const auth = getAuth();
  const recuperacionRef = (email) => db.collection('RECUPERACIONES').doc(hash(email));

  // ---------------------------------------------------------------- 1. Solicitar código
  app.post('/api/recuperacion/solicitar', async (req, res) => {
    try {
      const email = normalizarEmail(req.body?.email);
      if (!email) return error(res, 400, 'Ingresá tu correo electrónico.');

      let usuario;
      try {
        usuario = await auth.getUserByEmail(email);
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          return error(res, 404, 'No existe una cuenta registrada con ese correo.');
        }
        throw e;
      }

      const tienePassword = usuario.providerData.some((p) => p.providerId === 'password');
      if (!tienePassword) {
        return error(res, 400, 'Esta cuenta inicia sesión con Google, así que no tiene contraseña para recuperar.');
      }

      const ref = recuperacionRef(email);
      const anterior = await ref.get();
      const enviadoEn = anterior.exists ? anterior.get('EnviadoEn')?.toMillis() : 0;
      const segundosDesdeEnvio = (Date.now() - (enviadoEn || 0)) / 1000;
      if (segundosDesdeEnvio < SEGUNDOS_ENTRE_ENVIOS) {
        const espera = Math.ceil(SEGUNDOS_ENTRE_ENVIOS - segundosDesdeEnvio);
        return error(res, 429, `Esperá ${espera} segundos antes de pedir otro código.`);
      }

      const codigo = generarCodigo();
      await enviarMailConCodigo(email, codigo);
      await ref.set({
        Uid: usuario.uid,
        CodigoHash: hash(codigo),
        Vence: Timestamp.fromMillis(Date.now() + MINUTOS_VALIDEZ_CODIGO * 60000),
        EnviadoEn: Timestamp.now(),
        Intentos: 0,
      });

      return res.json({ exito: true, mensaje: 'Te enviamos el código.', segundosEntreEnvios: SEGUNDOS_ENTRE_ENVIOS });
    } catch (e) {
      console.error('Error en /api/recuperacion/solicitar:', e);
      return error(res, 500, 'No se pudo enviar el código. Intentá de nuevo en unos minutos.');
    }
  });

  // ---------------------------------------------------------------- 2. Verificar código
  app.post('/api/recuperacion/verificar', async (req, res) => {
    try {
      const email = normalizarEmail(req.body?.email);
      const codigo = String(req.body?.codigo || '').trim();
      if (!/^\d{8}$/.test(codigo)) return error(res, 400, 'Ingresá los 8 dígitos del código.');

      const ref = recuperacionRef(email);
      const snap = await ref.get();
      const datos = snap.data();
      if (!snap.exists || !datos.CodigoHash) {
        return error(res, 400, 'No hay un código pedido para este correo. Pedí uno nuevo.');
      }
      if (datos.Vence.toMillis() <= Date.now()) {
        return error(res, 400, 'El código venció. Pedí uno nuevo.');
      }
      if (datos.Intentos >= INTENTOS_MAXIMOS) {
        return error(res, 429, 'Superaste la cantidad de intentos. Pedí un código nuevo.');
      }

      if (!igualesSeguro(hash(codigo), datos.CodigoHash)) {
        const restantes = INTENTOS_MAXIMOS - datos.Intentos - 1;
        await ref.update({ Intentos: datos.Intentos + 1 });
        return error(
          res,
          400,
          restantes > 0
            ? `El código es incorrecto. Te quedan ${restantes} ${restantes === 1 ? 'intento' : 'intentos'}.`
            : 'El código es incorrecto. Superaste la cantidad de intentos: pedí uno nuevo.',
        );
      }

      // Código correcto: se cambia por un token de un solo uso para el paso final
      const token = crypto.randomBytes(32).toString('hex');
      await ref.update({
        CodigoHash: null,
        TokenHash: hash(token),
        TokenVence: Timestamp.fromMillis(Date.now() + MINUTOS_VALIDEZ_TOKEN * 60000),
      });
      return res.json({ exito: true, token });
    } catch (e) {
      console.error('Error en /api/recuperacion/verificar:', e);
      return error(res, 500, 'No se pudo verificar el código. Intentá de nuevo.');
    }
  });

  // ---------------------------------------------------------------- 3. Cambiar contraseña
  app.post('/api/recuperacion/cambiar', async (req, res) => {
    try {
      const email = normalizarEmail(req.body?.email);
      const token = String(req.body?.token || '');
      const password = String(req.body?.password || '');

      if (password.length < LARGO_MINIMO_PASSWORD) {
        return error(res, 400, `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`);
      }

      const ref = recuperacionRef(email);
      const snap = await ref.get();
      const datos = snap.data();
      const tokenValido =
        snap.exists &&
        datos.TokenHash &&
        igualesSeguro(hash(token), datos.TokenHash) &&
        datos.TokenVence.toMillis() > Date.now();
      if (!tokenValido) {
        return error(res, 401, 'La verificación venció. Volvé a pedir un código.');
      }

      const esIgual = await esLaContrasenaActual(email, password);
      if (esIgual === true) {
        return error(res, 400, 'La nueva contraseña no puede ser igual a la anterior.');
      }
      if (esIgual === null) {
        return error(res, 503, 'No pudimos validar la contraseña. Intentá de nuevo en unos minutos.');
      }

      await auth.updateUser(datos.Uid, { password });
      // Cierra la sesión en los otros teléfonos que tuvieran la contraseña vieja
      await auth.revokeRefreshTokens(datos.Uid);
      await ref.delete();

      return res.json({ exito: true, mensaje: 'Contraseña actualizada.' });
    } catch (e) {
      console.error('Error en /api/recuperacion/cambiar:', e);
      if (e.code === 'auth/invalid-password') {
        return error(res, 400, 'La contraseña no es válida. Probá con otra.');
      }
      return error(res, 500, 'No se pudo cambiar la contraseña. Intentá de nuevo.');
    }
  });
}

module.exports = { registrarRutasRecuperacion };
