// migrarDnis.js
// Crea en DNIS la reserva de cada DNI de USUARIOS (un documento por DNI con el uid del dueño).
// La app usa esas reservas para no dejar registrar un DNI dos veces; las cuentas creadas antes
// no las tienen. Se corre una sola vez. Si encuentra un DNI repetido no lo toca y lo informa.
//
//   node migrarDnis.js            -> solo muestra qué haría (no modifica nada)
//   node migrarDnis.js --aplicar  -> crea las reservas que faltan
require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
const db = getFirestore();

/** Igual que claveDeDni en la app (src/services/usuarios.ts). */
const claveDeDni = (dni) => String(dni ?? '').replace(/\D/g, '').replace(/^0+/, '');

async function main() {
  const aplicar = process.argv.includes('--aplicar');
  const [usuarios, reservas] = await Promise.all([
    db.collection('USUARIOS').get(),
    db.collection('DNIS').get(),
  ]);
  const reservadas = new Map(reservas.docs.map((d) => [d.id, d.get('Uid')]));

  const porDni = new Map();
  const sinDni = [];
  for (const usuario of usuarios.docs) {
    const clave = claveDeDni(usuario.get('DNI'));
    if (!clave) {
      sinDni.push(usuario.id);
      continue;
    }
    porDni.set(clave, [...(porDni.get(clave) || []), usuario.id]);
  }

  const aCrear = [];
  const repetidos = [];
  for (const [clave, uids] of porDni) {
    if (uids.length > 1) repetidos.push({ clave, uids });
    else if (!reservadas.has(clave)) aCrear.push({ clave, uid: uids[0] });
    else if (reservadas.get(clave) !== uids[0]) repetidos.push({ clave, uids: [reservadas.get(clave), ...uids] });
  }

  console.log(`USUARIOS: ${usuarios.size}. Reservas existentes: ${reservas.size}. A crear: ${aCrear.length}.`);
  if (sinDni.length) console.log(`Sin DNI válido (se saltean): ${sinDni.join(', ')}`);
  for (const { clave, uids } of repetidos) {
    console.log(`⚠️ DNI ${clave} repetido en: ${uids.join(', ')}. Corregilo a mano; no se reserva.`);
  }

  if (!aplicar) {
    if (aCrear.length) console.log('Corré "node migrarDnis.js --aplicar" para crearlas.');
    return;
  }

  const batch = db.batch();
  for (const { clave, uid } of aCrear) batch.create(db.collection('DNIS').doc(clave), { Uid: uid });
  await batch.commit();
  console.log(`Listo: ${aCrear.length} reservas creadas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
