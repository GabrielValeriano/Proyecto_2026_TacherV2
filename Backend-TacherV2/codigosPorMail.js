// codigosPorMail.js
// Lo que comparten la verificación del registro y la recuperación de contraseña:
// generar un código de 8 dígitos, guardarlo como hash y mandarlo por mail con EmailJS.
const crypto = require('crypto');

const LARGO_CODIGO = 8;

// Cuenta de EmailJS. Se puede cambiar desde el .env.
const EMAILJS = {
  url: 'https://api.emailjs.com/api/v1.0/email/send',
  serviceId: process.env.EMAILJS_SERVICE_ID || 'service_zbwfi2e',
  templateId: process.env.EMAILJS_TEMPLATE_ID || 'template_nsfs7b1',
  publicKey: process.env.EMAILJS_PUBLIC_KEY || 'qPBhMhwXdDurztFHm',
};

const hash = (texto) => crypto.createHash('sha256').update(texto).digest('hex');
const normalizarEmail = (email) => String(email || '').trim().toLowerCase();
const generarCodigo = () =>
  crypto.randomInt(0, 10 ** LARGO_CODIGO).toString().padStart(LARGO_CODIGO, '0');
const esCodigoValido = (codigo) => new RegExp(`^\\d{${LARGO_CODIGO}}$`).test(codigo);

/** Compara dos hashes sin filtrar información por el tiempo que tarda. */
function igualesSeguro(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const responderError = (res, status, mensaje) => res.status(status).json({ exito: false, mensaje });

/** `templateId` permite usar una plantilla distinta por flujo (registro / recuperación). */
async function enviarMailConCodigo(email, codigo, templateId = EMAILJS.templateId) {
  const respuesta = await fetch(EMAILJS.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost' },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: templateId,
      user_id: EMAILJS.publicKey,
      ...(process.env.EMAILJS_PRIVATE_KEY ? { accessToken: process.env.EMAILJS_PRIVATE_KEY } : {}),
      template_params: { to_email: email, code: codigo },
    }),
  });
  if (!respuesta.ok) {
    throw new Error(`EmailJS respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
}

/** Mensaje para un código incorrecto según los intentos que quedan. */
function mensajeCodigoIncorrecto(restantes) {
  return restantes > 0
    ? `El código es incorrecto. Te quedan ${restantes} ${restantes === 1 ? 'intento' : 'intentos'}.`
    : 'El código es incorrecto. Superaste la cantidad de intentos: pedí uno nuevo.';
}

module.exports = {
  EMAILJS,
  LARGO_CODIGO,
  hash,
  normalizarEmail,
  generarCodigo,
  esCodigoValido,
  igualesSeguro,
  responderError,
  enviarMailConCodigo,
  mensajeCodigoIncorrecto,
};
