// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuración de credenciales de Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// 2. Endpoint para validar reciclaje y sumar puntos
app.post('/api/validar-reciclaje', async (req, res) => {
  try {
    const { dni, codigo_producto } = req.body;

    // Error 1001: Parámetros faltantes
    if (!dni || !codigo_producto) {
      return res.status(400).json({
        exito: false,
        puntos: 0,
        codigo_error: 1001,
        mensaje: 'Faltan parámetros: dni y codigo_producto son obligatorios'
      });
    }

    const dniString = dni.toString().trim();
    const codigoString = codigo_producto.toString().trim();

    // Buscar Usuario por campo 'DNI'
    const usuariosRef = db.collection('USUARIOS');
    const usuarioSnap = await usuariosRef.where('DNI', '==', dniString).get();

    if (usuarioSnap.empty) {
      return res.status(404).json({
        exito: false,
        puntos: 0,
        codigo_error: 1003,
        mensaje: 'Usuario no registrado'
      });
    }

    // Buscar Residuo por campo 'Codigo_barras'
    const residuosRef = db.collection('RESIDUOS');
    const residuoSnap = await residuosRef.where('Codigo_barras', '==', codigoString).get();

    if (residuoSnap.empty) {
      return res.status(404).json({
        exito: false,
        puntos: 0,
        codigo_error: 2001,
        mensaje: 'Residuo / Código de barras no encontrado'
      });
    }

    // Obtener documentos de Firestore
    const usuarioDoc = usuarioSnap.docs[0];
    const residuoData = residuoSnap.docs[0].data();
    const puntosASumar = Number(residuoData.Puntos_valor) || 0;

    // Actualizar atomicamente los puntos del usuario en Firestore
    await usuarioDoc.ref.update({
      Puntos: FieldValue.increment(puntosASumar)
    });

    // Respuesta exitosa
    return res.status(200).json({
      exito: true,
      puntos: puntosASumar,
      codigo_error: 0,
      mensaje: 'Reciclaje validado y puntos sumados exitosamente'
    });

  } catch (error) {
    console.error('Error procesando reciclaje:', error);
    return res.status(500).json({
      exito: false,
      puntos: 0,
      codigo_error: 5000,
      mensaje: 'Error interno del servidor'
    });
  }
});
// 3. Inicio del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
});