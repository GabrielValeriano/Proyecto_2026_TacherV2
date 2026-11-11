// migrarReciclajes.js
// Pasa los reciclajes viejos de RECICLAJES (guardados con uid / fecha / puntos_ganados...)
// a los nombres que lee la app (Uid / Fecha / PuntosGanados...). Se corre una sola vez.
//
//   node migrarReciclajes.js            -> solo muestra cuántos hay que migrar (no modifica nada)
//   node migrarReciclajes.js --aplicar  -> los migra
require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
const db = getFirestore();

/** campo viejo -> campo nuevo */
const RENOMBRES = {
  uid: 'Uid',
  nombre_usuario: 'Usuario',
  dni: 'DNI',
  residuo: 'Residuo',
  codigo_barras: 'CodigoBarras',
  puntos_ganados: 'PuntosGanados',
  fecha: 'Fecha',
};

async function main() {
  const aplicar = process.argv.includes('--aplicar');
  const snap = await db.collection('RECICLAJES').get();

  const viejos = snap.docs.filter((d) => d.get('Uid') === undefined && d.get('uid') !== undefined);
  console.log(`RECICLAJES: ${snap.size} en total, ${viejos.length} con el formato viejo.`);
  if (!aplicar) {
    if (viejos.length) console.log('Corré "node migrarReciclajes.js --aplicar" para migrarlos.');
    return;
  }

  // Firestore permite hasta 500 escrituras por lote
  for (let i = 0; i < viejos.length; i += 400) {
    const lote = db.batch();
    for (const docSnap of viejos.slice(i, i + 400)) {
      const datos = docSnap.data();
      const cambios = {};
      for (const [viejo, nuevo] of Object.entries(RENOMBRES)) {
        if (datos[viejo] === undefined) continue;
        if (datos[nuevo] === undefined) cambios[nuevo] = datos[viejo];
        cambios[viejo] = FieldValue.delete();
      }
      lote.update(docSnap.ref, cambios);
    }
    await lote.commit();
  }
  console.log(`Listo: ${viejos.length} reciclajes migrados.`);
}

main().catch((error) => {
  console.error('Error en la migración:', error);
  process.exit(1);
});
