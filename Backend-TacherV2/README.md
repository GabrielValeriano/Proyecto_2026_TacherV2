# 🌐 Backend - Tacher V2

Servidor API RESTful que centraliza la lógica de negocio del ecosistema Tacher V2, actuando como puente entre el hardware embebido (ESP32), la aplicación móvil y la base de datos.

---

## 🛠️ Tecnologías
* Node.js / Express 5
* Firebase Firestore
* Render (Despliegue en la nube)

---

## ⚙️ Configuración de Variables de Entorno (`.env`)

Para que el backend funcione correctamente, debés crear un archivo `.env` en la raíz de esta carpeta con los siguientes parámetros de tu proyecto de Firebase y servidor:

```env
PORT=5000
# Completá aquí con tus credenciales de Firebase Firestore
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTuClavePrivadaAqui\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
```

## 📌 Endpoints Principales

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Verificación de estado del servidor |
| `POST` | `/api/verificar-dni` | Valida si un DNI está registrado en la base de datos |
| `POST` | `/api/verificar-residuo` | Consulta los datos y valor en puntos de un código de barras |
| `POST` | `/api/registrar-reciclaje` | Procesa el reciclaje, acredita puntos al usuario y guarda el historial |

---

## 🚀 Despliegue e Instalación Local

1. Clonar el repositorio e ingresar a esta carpeta:
   ```bash
   cd Backend-TacherV2
   npm install