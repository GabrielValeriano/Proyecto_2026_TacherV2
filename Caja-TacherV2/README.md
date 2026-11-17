# 🤖 Caja Tacher V2 - Firmware ESP32

Esta carpeta contiene el código fuente y firmware final para el microcontrolador **ESP32**, el cual opera como el cerebro del tótem físico de reciclaje inteligente del proyecto **Tacher V2**.

---

## 🔩 Componentes del Hardware Asociados

El código está diseñado para interactuar directamente con los siguientes componentes conectados a la placa ESP32:
* **Microcontrolador ESP32 DevKit v1:** Unidad central con conectividad Wi-Fi y soporte TLS/HTTPS.
* **Lector de Código de Barras (GM65):** Utilizado para el escaneo tanto de los DNI de los usuarios como de los códigos de barras de los residuos.
* **2x Servomotores (MG94GR):** Mecanismo de apertura y cierre de la compuerta de depósito de residuos.
* **Sensor Magnético (Reed Switch):** Sensor de seguridad "anti-trampa" colocado en la puerta para detectar aperturas indebidas.
* **Pantalla LCD 16x2 (I2C):** Interfaz visual para mostrar las instrucciones, mensajes de bienvenida y estados del sistema al usuario.

---

## 📄 Archivo Principal

* **`codigoFinalHTTPS.c++`**: Script principal de producción que incluye:
  * **Conexión HTTPS Segura:** Utiliza `WiFiClientSecure` con `.setInsecure()` para comunicarse de forma cifrada con el backend desplegado en Render sin necesidad de gestionar certificados raíz locales.
  * **Prevención de Arranque en Frío (*Cold Start*):** Realiza un ciclo inicial de verificación al encender y pings periódicos cada 10 minutos para mantener activa la instancia gratuita del servidor en la nube.
  * **Secuencia UX para LCD:** Flujo guiado de mensajes en tiempo real (*"Bienvenido [Nombre]"* $\rightarrow$ *"Deposita Tu residuo"* $\rightarrow$ *"Cierra la puerta"*).
  * **Lógica Anti-trampa:** Monitoreo constante del sensor Reed Switch durante la fase de depósito para cancelar la operación si la puerta se abre de forma prematura.

---

## 📊 3. Diagrama de Bloques

El diagrama de bloques detallado del flujo de datos y la interacción entre el usuario, el ESP32, el servidor en Render y Firebase se encuentra disponible en la carpeta de documentación:
👉 **[Ver Diagrama de Bloques](./docs/diagrama-de-bloques.png)**

---

## ⚙️ Configuración Personalizada (Wi-Fi y Servidor Propio)

El firmware está diseñado para que **puedas utilizar tu propia base de datos y backend** si lo deseas, sin necesidad de depender de la instancia oficial del proyecto. 

Antes de compilar y subir el código a tu ESP32 (`codigoFinalHTTPS.c++`), asegurate de modificar las siguientes constantes con tus propias credenciales:

```cpp
// 1. Credenciales de tu red Wi-Fi
const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASS = "TU_CONTRASEÑA_WIFI";

// 2. URL de tu propio servidor backend (puede ser local o en la nube como Render)
const String SERVER_BASE_URL = "[https://tu-backend-personal.onrender.com/api](https://tu-backend-personal.onrender.com/api)";