// server.js (Versión de Prueba / Mock)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint de prueba de salud
app.get('/', (req, res) => {
  res.send('Servidor de prueba de reciclaje activo');
});

// 1. Verificar DNI (Simulado: Siempre dice que el usuario existe)
app.post('/api/verificar-dni', (req, res) => {
  const { dni } = req.body;
  console.log(`[DNI Recibido]: ${dni}`);

  return res.status(200).json({
    exito: true,
    uid: "user_mock_123",
    nombre: "Gabriel (Prueba)",
    codigo_error: 0,
    mensaje: "Usuario verificado correctamente (Modo Prueba)"
  });
});

// 2. Verificar Residuo (Simulado: Siempre dice que el residuo existe y vale 50 puntos)
app.post('/api/verificar-residuo', (req, res) => {
  const { codigo_producto } = req.body;
  console.log(`[Código de Barras Recibido]: ${codigo_producto}`);

  return res.status(200).json({
    exito: true,
    nombre_residuo: "Botella Plástica PET",
    puntos_valor: 50,
    codigo_error: 0,
    mensaje: "Residuo válido (Modo Prueba)"
  });
});

// 3. Registrar Reciclaje (Simulado: Simula que sumó puntos y guardó el historial)
app.post('/api/registrar-reciclaje', (req, res) => {
  const { dni, codigo_producto } = req.body;
  console.log(` [Registrando Reciclaje] DNI: ${dni} | Código: ${codigo_producto}`);

  return res.status(200).json({
    exito: true,
    puntos_ganados: 50,
    codigo_error: 0,
    mensaje: "Reciclaje registrado con éxito y puntos acreditados (Modo Prueba)"
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de PRUEBA ejecutándose en http://0.0.0.0:${PORT}`);
});