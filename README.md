#  Tacher V2 - Sistema de Reciclaje Inteligente y Gamificado

> **Institución:** ETEC UBA (Escuela Técnica Secundaria de la Universidad de Buenos Aires)  
> **Proyecto:** Sistema integral de hardware embebido, backend en la nube y aplicaciones móviles para fomentar el reciclaje institucional.

---

## 📁 Estructura del Repositorio

Este proyecto está modularizado en 4 componentes principales:

* **`📂 TacherV2/`**  
  Aplicación móvil principal (React Native / Expo) orientada a los estudiantes. Permite consultar el balance de puntos, visualizar el nivel ambiental del usuario, revisar el historial de reciclaje y canjear beneficios o promociones.

* **`📂 TacherV2-Cajero/`**  
  Aplicación móvil secundaria destinada al personal de la institución (cajeros) para validar y escanear los codigos QR generados y presentados por los alumnos al momento de canjear sus puntos por algun producto de la app TacherV2.

* **`📂 Backend-TacherV2/`**  
  Servidor web y API RESTful (Node.js / Express 5) desplegado en **Render**. Es el encargado de procesar la lógica de negocio, autenticar peticiones, conectar con la base de datos en **Firebase Firestore** y gestionar las notificaciones.

* **`📂 Caja-TacherV2/`**  
  Firmware y código final en C++ para el microcontrolador **ESP32** instalado en el tótem físico de reciclaje. Controla el lector de barras, servomotores de compuerta, sensor magnético y pantalla LCD con soporte para peticiones HTTPS seguras.

---

## 📊 Presentación del Proyecto
La diapositiva oficial presentada en la *Semana de la Educación Técnica* se encuentra disponible en la carpeta de documentación del repositorio o en la sección de la caja física.

##  Objetivo del Proyecto

Incentivar el reciclaje en la comunidad educativa mediante un esquema gamificado: el usuario se identifica en el sistema físico (`Caja-TacherV2`) escaneando su DNI y deposita residuos identificados mediante su código de barras. Cada depósito suma puntos procesados en la nube (`Backend-TacherV2`) que luego son gestionados y canjeados por el usuario desde la app (`TacherV2`), mediante la app de (`TacherV2-Cajero`), que valida el QR que generas para canjear algun producto del catalogo de la app y luego te cobra los puntos.