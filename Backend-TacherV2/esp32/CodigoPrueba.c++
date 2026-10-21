#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// -------------------------------------------------------------
// Configuración de red y servidor
// -------------------------------------------------------------
const char* WIFI_SSID = "PEINE-3";
const char* WIFI_PASS = "etecPeine3";

// Reemplazá TU_IP_LOCAL por la IP de tu PC en la red local (ej: http://192.168.1.50:5000)
const String SERVER_BASE_URL = "http://10.56.16.69:5000/api";

// -------------------------------------------------------------
// Función para leer una entrada limpia del Monitor Serie
// -------------------------------------------------------------
String leerLineaSerial() {
  String entrada = "";
  while (true) {
    if (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        if (entrada.length() > 0) {
          break; // Fin de lectura al presionar Enter
        }
      } else {
        entrada += c;
      }
    }
    delay(10);
  }
  entrada.trim();
  return entrada;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.print("\n Conectando a Wi-Fi ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n Conectado a Wi-Fi.");
  Serial.print(" IP de la ESP32: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  Serial.println("\n========================================");
  Serial.println("   SISTEMA DE RECICLAJE - NUEVO CICLO   ");
  Serial.println("========================================");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(" Error, Sin conexión Wi-Fi. Esperando reconexión...");
    delay(2000);
    return;
  }

  HTTPClient http;

  // Ingresar y verificar DNI
  Serial.print(" Ingrese el DNI del usuario: ");
  String dni = leerLineaSerial();
  Serial.println(dni);

  String urlDni = SERVER_BASE_URL + "/verificar-dni";
  http.begin(urlDni);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> docReq1;
  docReq1["dni"] = dni;
  String body1;
  serializeJson(docReq1, body1);

  int httpCode1 = http.POST(body1);
  if (httpCode1 > 0) {
    String payload1 = http.getString();
    StaticJsonDocument<300> docRes1;
    deserializeJson(docRes1, payload1);

    bool exito1 = docRes1["exito"];
    if (!exito1) {
      Serial.println(" Usuario no válido. Reiniciando ciclo...");
      http.end();
      return;
    }

    const char* nombreUsuario = docRes1["nombre"];
    Serial.printf(" LCD -> ¡Bienvenido: %s!\n", nombreUsuario);
  } else {
    Serial.println(" Error de conexión en Paso 1.");
    http.end();
    return;
  }
  http.end();

  // Ingresar y verificar el Residuo (Código de barras)
  Serial.print("\n Ingrese el Código de Barras del residuo: ");
  String codigoResiduo = leerLineaSerial();
  Serial.println(codigoResiduo);

  String urlResiduo = SERVER_BASE_URL + "/verificar-residuo";
  http.begin(urlResiduo);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> docReq2;
  docReq2["codigo_producto"] = codigoResiduo;
  String body2;
  serializeJson(docReq2, body2);

  int httpCode2 = http.POST(body2);
  if (httpCode2 > 0) {
    String payload2 = http.getString();
    StaticJsonDocument<300> docRes2;
    deserializeJson(docRes2, payload2);

    bool exito2 = docRes2["exito"];
    if (!exito2) {
      Serial.println(" Residuo no válido. Reiniciando ciclo...");
      http.end();
      return;
    }

    const char* nombreResiduo = docRes2["nombre_residuo"];
    int puntosValor = docRes2["puntos_valor"];
    Serial.printf(" LCD -> Residuo: %s | Valor: %d pts\n", nombreResiduo, puntosValor);
  } else {
    Serial.println(" Error de conexión en Paso 2.");
    http.end();
    return;
  }
  http.end();

  // -------------------------------------------------------------
  // PASO 3: Validación Física (Simulación de Puerta y Servos)
  // -------------------------------------------------------------
  Serial.println("\n Verificando estado de la puerta...");
  delay(1000);
  Serial.println(" Puerta cerrada confirmada.");
  Serial.println(" Abriendo servomotores... El residuo ha caído al tacho.");
  delay(1500); // Simula el tiempo en que cae el residuo
  Serial.println(" Cerrando servomotores.");

  // -------------------------------------------------------------
  // PASO 4: Registrar Reciclaje y Acreditar Puntos
  // -------------------------------------------------------------
  Serial.println("\n Registrando transacción en el servidor...");

  String urlRegistro = SERVER_BASE_URL + "/registrar-reciclaje";
  http.begin(urlRegistro);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> docReq3;
  docReq3["dni"] = dni;
  docReq3["codigo_producto"] = codigoResiduo;
  String body3;
  serializeJson(docReq3, body3);

  int httpCode3 = http.POST(body3);
  if (httpCode3 > 0) {
    String payload3 = http.getString();
    StaticJsonDocument<300> docRes3;
    deserializeJson(docRes3, payload3);

    bool exito3 = docRes3["exito"];
    if (exito3) {
      int puntosGanados = docRes3["puntos_ganados"];
      Serial.println("========================================");
      Serial.printf(" ¡RECICLAJE COMPLETADO CON ÉXITO!\n");
      Serial.printf(" Se sumaron %d puntos en tu cuenta.\n", puntosGanados);
      Serial.println("========================================");
    } else {
      Serial.println(" Error al registrar el reciclaje en el servidor.");
    }
  } else {
    Serial.println(" Error de conexión en Paso 4.");
  }
  http.end();

  Serial.println("\n Volviendo a la pantalla de bienvenida en 3 segundos...\n");
  delay(3000);
}