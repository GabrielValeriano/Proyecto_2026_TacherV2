// verificacionRegistro.js
// Verificación del correo al registrarse, con un código de 8 dígitos enviado por mail
// (reemplaza al link de verificación de Firebase).
//
//   POST /api/registro/enviar-codigo     {}          -> manda el código al mail de la cuenta
//   POST /api/registro/verificar-codigo  { codigo }  -> si es correcto, marca el mail como verificado
//
// Las dos rutas piden el header `Authorization: Bearer <ID token de Firebase>`: la cuenta ya existe
// en Auth (se crea en la pantalla de registro), y así nadie puede verificar un mail que no es suyo.
// En Firestore (VERIFICACIONES_REGISTRO/{uid}) se guarda solo el hash del código.
const { getAuth } = require('firebase-admin/auth');
const { Timestamp } = require('firebase-admin/firestore');
const {
  EMAILJS,
  hash,
  generarCodigo,
  esCodigoValido,
  igualesSeguro,
  responderError: error,
  enviarMailConCodigo,
  mensajeCodigoIncorrecto,
} = require('./codigosPorMail');

const MINUTOS_VALIDEZ_CODIGO = 10;
const SEGUNDOS_ENTRE_ENVIOS = 60;
const INTENTOS_MAXIMOS = 5;
const TEMPLATE_REGISTRO = process.env.EMAILJS_TEMPLATE_REGISTRO || EMAILJS.templateId;

function registrarRutasVerificacionRegistro(app, db) {
  const auth = getAuth();
  const verificacionRef = (uid) => db.collection('VERIFICACIONES_REGISTRO').doc(uid);

  /** Lee el ID token del header y devuelve el usuario de Auth, o responde 401. */
  async function usuarioDelPedido(req, res) {
    const [tipo, idToken] = String(req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !idToken) {
      error(res, 401, 'Tu sesión expiró. Volvé a registrarte.');
      return null;
    }
    try {
      const { uid } = await auth.verifyIdToken(idToken);
      return await auth.getUser(uid);
    } catch (e) {
      console.warn('ID token inválido en la verificación del registro:', e.code || e.message);
      error(res, 401, 'Tu sesión expiró. Volvé a registrarte.');
      return null;
    }
  }

  // ---------------------------------------------------------------- 1. Enviar código
  app.post('/api/registro/enviar-codigo', async (req, res) => {
    try {
      const usuario = await usuarioDelPedido(req, res);
      if (!usuario) return;
      if (!usuario.email) return error(res, 400, 'La cuenta no tiene un correo asociado.');

      if (usuario.emailVerified) {
        return res.json({ exito: true, yaVerificado: true });
      }

      const ref = verificacionRef(usuario.uid);
      const anterior = await ref.get();
      const enviadoEn = anterior.exists ? anterior.get('EnviadoEn')?.toMillis() || 0 : 0;
      const segundosDesdeEnvio = (Date.now() - enviadoEn) / 1000;

      // Si hace poco que se mandó uno (por ejemplo, se volvió a abrir la pantalla), no se manda
      // otro: el anterior sigue sirviendo. La app muestra cuánto falta para poder reenviar.
      if (segundosDesdeEnvio < SEGUNDOS_ENTRE_ENVIOS) {
        return res.json({
          exito: true,
          enviado: false,
          segundosParaReenviar: Math.ceil(SEGUNDOS_ENTRE_ENVIOS - segundosDesdeEnvio),
        });
      }

      const codigo = generarCodigo();
      await enviarMailConCodigo(usuario.email, codigo, TEMPLATE_REGISTRO);
      await ref.set({
        Email: usuario.email,
        CodigoHash: hash(codigo),
        Vence: Timestamp.fromMillis(Date.now() + MINUTOS_VALIDEZ_CODIGO * 60000),
        EnviadoEn: Timestamp.now(),
        Intentos: 0,
      });

      return res.json({ exito: true, enviado: true, segundosParaReenviar: SEGUNDOS_ENTRE_ENVIOS });
    } catch (e) {
      console.error('Error en /api/registro/enviar-codigo:', e);
      return error(res, 500, 'No se pudo enviar el código. Intentá de nuevo en unos minutos.');
    }
  });

  // ---------------------------------------------------------------- 2. Verificar código
  app.post('/api/registro/verificar-codigo', async (req, res) => {
    try {
      const usuario = await usuarioDelPedido(req, res);
      if (!usuario) return;
      if (usuario.emailVerified) return res.json({ exito: true });

      const codigo = String(req.body?.codigo || '').trim();
      if (!esCodigoValido(codigo)) return error(res, 400, 'Ingresá los 8 dígitos del código.');

      const ref = verificacionRef(usuario.uid);
      const snap = await ref.get();
      const datos = snap.data();
      if (!snap.exists || !datos.CodigoHash) {
        return error(res, 400, 'No hay un código pedido para esta cuenta. Pedí uno nuevo.');
      }
      if (datos.Vence.toMillis() <= Date.now()) {
        return error(res, 400, 'El código venció. Pedí uno nuevo.');
      }
      if (datos.Intentos >= INTENTOS_MAXIMOS) {
        return error(res, 429, 'Superaste la cantidad de intentos. Pedí un código nuevo.');
      }

      if (!igualesSeguro(hash(codigo), datos.CodigoHash)) {
        await ref.update({ Intentos: datos.Intentos + 1 });
        return error(res, 400, mensajeCodigoIncorrecto(INTENTOS_MAXIMOS - datos.Intentos - 1));
      }

      // Código correcto: queda verificado en Firebase Auth, igual que con el link de antes
      await auth.updateUser(usuario.uid, { emailVerified: true });
      await ref.delete();
      return res.json({ exito: true });
    } catch (e) {
      console.error('Error en /api/registro/verificar-codigo:', e);
      return error(res, 500, 'No se pudo verificar el código. Intentá de nuevo.');
    }
  });
}

module.exports = { registrarRutasVerificacionRegistro };
