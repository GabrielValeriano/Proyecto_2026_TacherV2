// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Endpoint de prueba de salud
app.get('/', (req, res) => {
  res.send('API de Sistema de Reciclaje Inteligente activa.');
});

// =========================================================================
// PASO 1: Verificar DNI del usuario
// =========================================================================
app.post('/api/verificar-dni', async (req, res) => {
  try {
    const { dni } = req.body;

    if (!dni) {
      return res.status(400).json({
        exito: false,
        codigo_error: 1001,
        mensaje: 'Falta el parámetro: dni'
      });
    }

    const dniString = dni.toString().trim();
    const usuariosRef = db.collection('USUARIOS');
    const usuarioSnap = await usuariosRef.where('DNI', '==', dniString).get();

    if (usuarioSnap.empty) {
      return res.status(404).json({
        exito: false,
        codigo_error: 1003,
        mensaje: 'Usuario no registrado'
      });
    }

    const usuarioDoc = usuarioSnap.docs[0];
    const usuarioData = usuarioDoc.data();

    return res.status(200).json({
      exito: true,
      uid: usuarioDoc.id,
      nombre: usuarioData.Nombre || 'Usuario',
      codigo_error: 0,
      mensaje: 'Usuario encontrado'
    });

  } catch (error) {
    console.error('Error en /api/verificar-dni:', error);
    return res.status(500).json({
      exito: false,
      codigo_error: 5000,
      mensaje: 'Error interno del servidor'
    });
  }
});

// =========================================================================
// PASO 2: Verificar Código de Barras del Residuo
// =========================================================================
app.post('/api/verificar-residuo', async (req, res) => {
  try {
    const { codigo_residuo } = req.body;

    if (!codigo_residuo) {
      return res.status(400).json({
        exito: false,
        codigo_error: 1001,
        mensaje: 'Falta el parámetro: codigo_producto'
      });
    }

    const codigoString = codigo_residuo.toString().trim();
    const residuosRef = db.collection('RESIDUOS');
    const residuoSnap = await residuosRef.where('Codigo_barras', '==', codigoString).get();

    if (residuoSnap.empty) {
      return res.status(404).json({
        exito: false,
        codigo_error: 2001,
        mensaje: 'Residuo no encontrado en la base de datos'
      });
    }

    const residuoData = residuoSnap.docs[0].data();

    return res.status(200).json({
      exito: true,
      nombre_residuo: residuoData.Nombre || 'Residuo',
      puntos_valor: Number(residuoData.Puntos_valor) || 0,
      codigo_error: 0,
      mensaje: 'Residuo válido'
    });

  } catch (error) {
    console.error('Error en /api/verificar-residuo:', error);
    return res.status(500).json({
      exito: false,
      codigo_error: 5000,
      mensaje: 'Error interno del servidor'
    });
  }
});

// =========================================================================
// PASO 4: Registrar Reciclaje (Sumar Puntos y Guardar Historial)
// =========================================================================
app.post('/api/registrar-reciclaje', async (req, res) => {
  try {
    const { dni, codigo_producto } = req.body;

    if (!dni || !codigo_producto) {
      return res.status(400).json({
        exito: false,
        codigo_error: 1001,
        mensaje: 'Faltan parámetros: dni y codigo_producto'
      });
    }

    const dniString = dni.toString().trim();
    const codigoString = codigo_producto.toString().trim();

    // 1. Buscar usuario nuevamente para asegurar consistencia y obtener referencia
    const usuariosRef = db.collection('USUARIOS');
    const usuarioSnap = await usuariosRef.where('DNI', '==', dniString).get();

    if (usuarioSnap.empty) {
      return res.status(404).json({ exito: false, codigo_error: 1003, mensaje: 'Usuario no encontrado' });
    }

    const usuarioDoc = usuarioSnap.docs[0];
    const usuarioData = usuarioDoc.data();
    const nombreUsuario = usuarioData.Nombre || 'Usuario';

    // 2. Buscar residuo para obtener sus puntos y nombre exactos
    const residuosRef = db.collection('RESIDUOS');
    const residuoSnap = await residuosRef.where('Codigo_barras', '==', codigoString).get();

    if (residuoSnap.empty) {
      return res.status(404).json({ exito: false, codigo_error: 2001, mensaje: 'Residuo no encontrado' });
    }

    const residuoData = residuoSnap.docs[0].data();
    const puntosGanados = Number(residuoData.Puntos_valor) || 0;
    const nombreResiduo = residuoData.Nombre || 'Residuo';

    // 3. Actualizar puntos del usuario de forma atómica
    await usuarioDoc.ref.update({
      Puntos: FieldValue.increment(puntosGanados)
    });

    // 4. Registrar en la colección 'reciclajes'
    await db.collection('RECICLAJES').add({
      uid: usuarioDoc.id,
      nombre_usuario: nombreUsuario,
      dni: dniString,
      residuo: nombreResiduo,
      codigo_barras: codigoString,
      puntos_ganados: puntosGanados,
      fecha: Timestamp.now()
    });

    return res.status(200).json({
      exito: true,
      puntos_ganados: puntosGanados,
      codigo_error: 0,
      mensaje: 'Reciclaje completado con éxito y puntos acreditados'
    });

  } catch (error) {
    console.error('Error en /api/registrar-reciclaje:', error);
    return res.status(500).json({
      exito: false,
      codigo_error: 5000,
      mensaje: 'Error interno del servidor'
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
});