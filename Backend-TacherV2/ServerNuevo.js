// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { notificarUsuario } = require('./notificaciones');
const { registrarRutasRecuperacion } = require('./recuperacion');
const { registrarRutasVerificacionRegistro } = require('./verificacionRegistro');

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

// Códigos de 8 dígitos por mail (los usa la app): recuperar contraseña y verificar el registro
registrarRutasRecuperacion(app, db);
registrarRutasVerificacionRegistro(app, db);

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
    // Aceptamos tanto codigo_residuo como codigo_producto para evitar fallos de compatibilidad
    const codigo_residuo = req.body.codigo_residuo || req.body.codigo_producto;

    if (!codigo_residuo) {
      return res.status(400).json({
        exito: false,
        codigo_error: 1001,
        mensaje: 'Falta el parámetro: codigo_residuo'
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
// PASO 4: Registrar Reciclaje usando el campo Puntos de USUARIOS
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

    // 1. Buscar usuario
    const usuariosRef = db.collection('USUARIOS');
    const usuarioSnap = await usuariosRef.where('DNI', '==', dniString).get();

    if (usuarioSnap.empty) {
      return res.status(404).json({ exito: false, codigo_error: 1003, mensaje: 'Usuario no encontrado' });
    }

    const usuarioDoc = usuarioSnap.docs[0];
    const usuarioData = usuarioDoc.data();
    const nombreUsuario = usuarioData.Nombre || 'Usuario';

    // 2. Buscar residuo
    const residuosRef = db.collection('RESIDUOS');
    const residuoSnap = await residuosRef.where('Codigo_barras', '==', codigoString).get();

    if (residuoSnap.empty) {
      return res.status(404).json({ exito: false, codigo_error: 2001, mensaje: 'Residuo no encontrado' });
    }

    const residuoDoc = residuoSnap.docs[0];
    const residuoData = residuoDoc.data();
    const puntosGanados = Number(residuoData.Puntos_valor) || 0;
    const nombreResiduo = residuoData.Nombre || 'Residuo';

    // 3. Sumar al campo 'Puntos' e incrementar 'reciclajes' en +1 en la colección USUARIOS
    await usuarioDoc.ref.update({
      Puntos: FieldValue.increment(puntosGanados),
      reciclajes: FieldValue.increment(1)
    });

    // 4. Consultar el documento actualizado de USUARIOS para obtener el total real de 'Puntos'
    const usuarioActualizadoSnap = await usuarioDoc.ref.get();
    const puntosTotalesReales = usuarioActualizadoSnap.data().Puntos || 0;

    // 5. Registrar el historial en la colección 'RECICLAJES'.
    //    Los nombres de los campos tienen que coincidir con los que lee la app
    //    (CAMPOS en TacherV2/src/services/reciclajes.ts): la app filtra por 'Uid' y ordena por 'Fecha'.
    await db.collection('RECICLAJES').add({
      Uid: usuarioDoc.id,
      Usuario: nombreUsuario,
      DNI: dniString,
      Residuo: nombreResiduo,
      ResiduoId: residuoDoc.id,
      ...(residuoData.Categoria ? { Categoria: residuoData.Categoria } : {}),
      CodigoBarras: codigoString,
      PuntosGanados: puntosGanados,
      Fecha: Timestamp.now()
    });

    // 6. Aviso en la app (pantalla Notificaciones + push). Sin await: no demora la respuesta a la ESP32
    notificarUsuario(db, usuarioDoc.ref, usuarioActualizadoSnap.data(), {
      tipo: 'reciclaje',
      titulo: '¡Reciclaje registrado!',
      mensaje: `Reciclaste ${nombreResiduo} y sumaste ${puntosGanados} puntos. Ahora tenés ${puntosTotalesReales}.`
    });

    // 7. Devolver a la ESP32 los puntos ganados y el total leídos directo de USUARIOS
    return res.status(200).json({
      exito: true,
      puntos_ganados: puntosGanados,
      puntos_totales: puntosTotalesReales, // 👈 Extraído directamente de la tabla USUARIOS
      codigo_error: 0,
      mensaje: 'Reciclaje completado con éxito'
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