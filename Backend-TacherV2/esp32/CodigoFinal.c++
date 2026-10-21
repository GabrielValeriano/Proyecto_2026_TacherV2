#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// Configuración de Red y Servidor
const char* WIFI_SSID = "PEINE-3";
const char* WIFI_PASS = "etecPeine3";

// Reemplazá TU_IP_LOCAL por la IP de tu PC en la red local 
const String SERVER_BASE_URL = "http://10.56.16.69:5000/api";

// Definición de Pines (GM65 y Servos / Puerta)
const int PIN_GM65_RX = 23;     // RX del ESP32 conectado al TX del GM65
const int PIN_GM65_TX = 27;     // TX del ESP32 conectado al RX del GM65 (Libera el 27 solo para el GM65)

const int PIN_REED_SWITCH = 12; // Sensor magnético de la puerta
const int PIN_SERVOS = 33;      // GPIO 33 ÚNICO para controlar ambos servomotores

Servo servoIzquierdo;
Servo servoDerecho;

// Funciones de Actuación de la Puerta / Servos
void abrirServos() {
  Serial.println(">>> Abriendo servomotores (Dejar caer residuo)...");
  servoDerecho.write(90);
  servoIzquierdo.write(180);
}

void cerrarServos() {
  Serial.println(">>> Posicionando servomotores en reposo (Cerrados)...");
  servoDerecho.write(10);
  servoIzquierdo.write(110);
}

// Función para lectura dual (Lector GM65 por Serial1 o Teclado Serie)
String leerEntradaDispositivo() {
  String dato = "";
  while (true) {
    // Intentamos leer desde el lector GM65 físico (Serial1)
    if (Serial1.available() > 0) {
      delay(80); // Esperar trama completa
      while (Serial1.available() > 0) {
        char c = Serial1.read();
        if (c != '\r' && c != '\n') {
          dato += c;
        }
      }
      dato.trim();
      if (dato.length() > 0) return dato;
    }
    
    // Respaldo: Ingreso manual por Monitor Serie (PC)
    if (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        if (dato.length() > 0) break;
      } else {
        dato += c;
      }
    }
    delay(10);
  }
  dato.trim();
  return dato;
}

// SETUP
void setup() {
  Serial.begin(115200);
  delay(1000);

  // Iniciar comunicación con el lector GM65
  Serial1.begin(9600, SERIAL_8N1, PIN_GM65_RX, PIN_GM65_TX);

  // Configuración del sensor Reed Switch
  pinMode(PIN_REED_SWITCH, INPUT_PULLUP);

  // Ambos servomotores conectados y adjuntados al GPIO 33
  servoDerecho.attach(PIN_SERVOS, 500, 2400);
  servoIzquierdo.attach(PIN_SERVOS, 500, 2400);
  cerrarServos(); // Estado inicial seguro

  // Conexión Wi-Fi
  Serial.print("\n Conectando a Wi-Fi.... ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n Conectado a Wi-Fi con éxito.");
  Serial.print(" IP de la ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.println(" Sistema TACHER V3 Listo y operativo.");
}

// LOOP
void loop() {
  Serial.println("\n========================================");
  Serial.println("   SISTEMA TACHER V2 - NUEVO CICLO      ");
  Serial.println("========================================");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(" Error, Sin conexión Wi-Fi. Esperando reconexión...");
    delay(2000);
    return;
  }

  HTTPClient http;

  // PASO 1: Ingresar y verificar DNI (Escaneo o Teclado)
  Serial.println(" Escanee su DNI (o ingréselo por teclado):");
  String dni = leerEntradaDispositivo();
  Serial.print(" DNI Detectado: ");
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

    if (!docRes1["exito"].as<bool>()) {
      Serial.println(" Usuario no registrado. Reiniciando ciclo...");
      http.end();
      delay(2000);
      return;
    }

    const char* nombreUsuario = docRes1["nombre"];
    Serial.printf(" ¡Bienvenido, %s!\n", nombreUsuario);
  } else {
    Serial.println(" Error de conexión en Paso 1.");
    http.end();
    return;
  }
  http.end();

  // PASO 2: Ingresar y verificar el Residuo (Código de barras)
  Serial.println("\n Escanee el Código de Barras del residuo:");
  String codigoResiduo = leerEntradaDispositivo();
  Serial.print(" Código de barras del Residuo Detectado: ");
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

    if (!docRes2["exito"].as<bool>()) {
      Serial.println(" Residuo no válido en la base de datos. Reiniciando ciclo...");
      http.end();
      delay(2000);
      return;
    }

    const char* nombreResiduo = docRes2["nombre_residuo"];
    int puntosValor = docRes2["puntos_valor"];
    Serial.printf(" Residuo: %s | Valor: %d pts\n", nombreResiduo, puntosValor);
  } else {
    Serial.println(" Error de conexión en Paso 2.");
    http.end();
    return;
  }
  http.end();

  // PASO 3: Validación Física (Apertura y Cierre de Servos)
  Serial.println("\n Abriendo compuerta del tacho...");
  abrirServos();
  delay(2500); // Tiempo para que caiga el residuo
  cerrarServos();
  Serial.println(" Compuerta cerrada.");

  // PASO 4: Registrar Reciclaje y Sumar Puntos en Servidor
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

    if (docRes3["exito"].as<bool>()) {
      int puntosGanados = docRes3["puntos_ganados"];
      Serial.println("========================================");
      Serial.printf(" ¡RECICLAJE COMPLETADO CON ÉXITO!\n");
      Serial.printf(" Se acreditaron %d puntos en tu cuenta.\n", puntosGanados);
      Serial.println("========================================");
    } else {
      Serial.println(" Error al registrar el reciclaje en el servidor.");
    }
  } else {
    Serial.println(" Error de conexión en Paso 4.");
  }
  http.end();

  Serial.println("\n Reiniciando sistema en 3 segundos...\n");
  delay(3000);
}