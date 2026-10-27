#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// -------------------------------------------------------------
// Configuración de Red y Servidor
// -------------------------------------------------------------
const char* WIFI_SSID = "PEINE-3";
const char* WIFI_PASS = "etecPeine3";

// Reemplazá con la IP local de tu PC en la red local 
const String SERVER_BASE_URL = "http://10.56.16.12:5000/api";

// -------------------------------------------------------------
// Definición de Pines
// -------------------------------------------------------------
const int PIN_GM65_RX = 26;     // RX del ESP32 conectado al TX del GM65
const int PIN_GM65_TX = 27;     // TX del ESP32 conectado al RX del GM65

const int PIN_REED_SWITCH = 23;  // GPIO 23 para el Sensor Magnético de la puerta
const int PIN_SERVOS = 33;      // GPIO 33 ÚNICO para controlar ambos servomotores

// Pines I2C para el LCD
const int PIN_SDA = 21;
const int PIN_SCL = 22;

// Instancia del LCD (Dirección 0x27, 16 columnas, 2 filas)
LiquidCrystal_I2C lcd(0x27, 16, 2);

Servo servoIzquierdo;
Servo servoDerecho;

// -------------------------------------------------------------
// Funciones de Actuación de la Puerta / Servos
// -------------------------------------------------------------
void abrirServos() {
  Serial.println(">>> Abriendo servomotores (Dejar caer residuo)...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Abriendo tolva");
  servoDerecho.write(90);
  servoIzquierdo.write(180);
}

void cerrarServos() {
  Serial.println(">>> Posicionando servomotores en reposo (Cerrados)...");
  servoDerecho.write(10);
  servoIzquierdo.write(110);
}

// -------------------------------------------------------------
// Función para leer DNI (Lectura estándar)
// -------------------------------------------------------------
String leerDNI() {
  // 🧹 Limpiar cualquier residuo o carácter fantasma anterior en los buffers
  while (Serial1.available() > 0) Serial1.read();
  while (Serial.available() > 0) Serial.read();

  String dato = "";
  while (true) {
    if (Serial1.available() > 0) {
      delay(80);
      while (Serial1.available() > 0) {
        char c = Serial1.read();
        if (c != '\r' && c != '\n') dato += c;
      }
      dato.trim();
      if (dato.length() > 0) return dato;
    }
    
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

// -------------------------------------------------------------
// Función Especial para Residuo (Anti-acumulación y Control de Puerta)
// -------------------------------------------------------------
String obtenerUltimoResiduoConControlDePuerta() {
  // Limpiar buffer antes de empezar a escanear residuos también
  while (Serial1.available() > 0) Serial1.read();
  while (Serial.available() > 0) Serial.read();

  String ultimoCodigo = "";
  bool avisoPuertaMostrado = false;

  Serial.println("\n==================================================");
  Serial.println("📦 ESCANEO DE RESIDUO");
  Serial.println("ℹ️ Puede escanear varios códigos; se usará ÚNICAMENTE el último.");
  Serial.println("🔒 Cierre la puerta del tacho para procesar el residuo.");
  Serial.println("==================================================");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Escanee Residuo");

  while (true) {
    // 1. Capturar códigos del escáner o teclado sin acumular (el último pisa al anterior)
    if (Serial1.available() > 0) {
      delay(80);
      String tempDato = "";
      while (Serial1.available() > 0) {
        char c = Serial1.read();
        if (c != '\r' && c != '\n') tempDato += c;
      }
      tempDato.trim();
      if (tempDato.length() > 0) {
        ultimoCodigo = tempDato;
        Serial.print("👉 Código detectado (Actualizado): ");
        Serial.println(ultimoCodigo);
        
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Ultimo Codigo:");
        lcd.setCursor(0, 1);
        lcd.print(ultimoCodigo.substring(0, 16));
      }
    }

    if (Serial.available() > 0) {
      String tempDato = Serial.readStringUntil('\n');
      tempDato.trim();
      if (tempDato.length() > 0) {
        ultimoCodigo = tempDato;
        Serial.print("👉 Código ingresado manual (Actualizado): ");
        Serial.println(ultimoCodigo);

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Ultimo Codigo:");
        lcd.setCursor(0, 1);
        lcd.print(ultimoCodigo.substring(0, 16));
      }
    }

    // 2. Verificar estado de la puerta (LOW = Cerrada, HIGH = Abierta)
    bool puertaAbierta = (digitalRead(PIN_REED_SWITCH) == HIGH);

    if (puertaAbierta) {
      if (!avisoPuertaMostrado) {
        Serial.println("⚠️ [PUERTA ABIERTA] Cierre la puerta para validar el residuo...");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("PUERTA ABIERTA");
        lcd.setCursor(0, 1);
        lcd.print("Cierre la puerta");
        avisoPuertaMostrado = true;
      }
    } else {
      // Puerta CERRADA
      if (avisoPuertaMostrado) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Escanee Residuo");
        if (ultimoCodigo.length() > 0) {
          lcd.setCursor(0, 1);
          lcd.print(ultimoCodigo.substring(0, 16));
        }
      }
      avisoPuertaMostrado = false;
      
      // Si ya tenemos un código escaneado y la puerta está cerrada, avanzamos
      if (ultimoCodigo.length() > 0) {
        Serial.println("✅ Puerta cerrada confirmada con código válido.");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Puerta Cerrada");
        lcd.setCursor(0, 1);
        lcd.print("Validando...");
        delay(200);
        break; 
      } else {
        static unsigned long tUltimoAviso = 0;
        if (millis() - tUltimoAviso > 3000) {
          Serial.println("⏳ Puerta cerrada. Por favor, escanee el código del residuo...");
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Puerta Cerrada");
          lcd.setCursor(0, 1);
          lcd.print("Escanee residuo");
          tUltimoAviso = millis();
        }
      }
    }
    delay(50);
  }
  return ultimoCodigo;
}

// -------------------------------------------------------------
// SETUP
// -------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(PIN_SDA, PIN_SCL);
  lcd.init();
  lcd.backlight();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TACHER V4");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");

  Serial1.begin(9600, SERIAL_8N1, PIN_GM65_RX, PIN_GM65_TX);
  pinMode(PIN_REED_SWITCH, INPUT_PULLUP);

  servoDerecho.attach(PIN_SERVOS, 500, 2400);
  servoIzquierdo.attach(PIN_SERVOS, 500, 2400);
  cerrarServos();

  Serial.print("\n📶 Conectando a Wi-Fi ");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Conectando WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(intentos % 16, 1);
    lcd.print(".");
    intentos++;
  }
  Serial.println("\n✅ Conectado a Wi-Fi con éxito.");
  Serial.print("📍 IP de la ESP32: ");
  Serial.println(WiFi.localIP());
  Serial.println("🚀 Sistema TACHER V4 Listo y operativo.");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sistema Listo");
  delay(2000);
}

// -------------------------------------------------------------
// LOOP PRINCIPAL
// -------------------------------------------------------------
void loop() {
  cerrarServos();
  Serial.println("\n========================================");
  Serial.println("   SISTEMA TACHER V4 - NUEVO CICLO      ");
  Serial.println("========================================");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("NUEVO CICLO");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Error: Sin conexión Wi-Fi. Esperando reconexión...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sin conexion WiFi");
    delay(2000);
    return;
  }

  // -------------------------------------------------------------
  // PASO 1: Ingresar y verificar DNI (Objeto HTTP independiente)
  // -------------------------------------------------------------
  Serial.println("👉 Escanee su DNI (o ingréselo por teclado):");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Escanee su DNI:");

  String dni = leerDNI();
  Serial.print("📄 DNI Detectado: ");
  Serial.println(dni);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("DNI Detectado:");
  lcd.setCursor(0, 1);
  lcd.print(dni.substring(0, 16));

  HTTPClient httpDni;
  String urlDni = SERVER_BASE_URL + "/verificar-dni";
  httpDni.begin(urlDni);
  httpDni.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> docReq1;
  docReq1["dni"] = dni;
  String body1;
  serializeJson(docReq1, body1);

  int httpCode1 = httpDni.POST(body1);
  if (httpCode1 > 0) {
    String payload1 = httpDni.getString();
    StaticJsonDocument<300> docRes1;
    deserializeJson(docRes1, payload1);

    if (!docRes1["exito"].as<bool>()) {
      Serial.println("❌ Usuario no registrado. Reiniciando ciclo...");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Usuario no");
      lcd.setCursor(0, 1);
      lcd.print("Registrado");
      httpDni.end();
      delay(2000);
      return;
    }

    const char* nombreUsuario = docRes1["nombre"];
    Serial.printf("🟢 ¡Bienvenido, %s!\n", nombreUsuario);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Bienvenido,");
    lcd.setCursor(0, 1);
    lcd.print(String(nombreUsuario).substring(0, 16));
    delay(2000);
  } else {
    Serial.println("❌ Error de conexión en Paso 1.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error de Conexion");
    httpDni.end();
    delay(2000);
    return;
  }
  httpDni.end();

  // -------------------------------------------------------------
  // PASO 2: Escanear residuo con control de puerta y último código
  // -------------------------------------------------------------
  String codigoResiduo = obtenerUltimoResiduoConControlDePuerta();
  Serial.print("📦 Código de Residuo a Verificar: ");
  Serial.println(codigoResiduo);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Validando residuo");
  lcd.setCursor(0, 1);
  lcd.print(codigoResiduo.substring(0, 16));

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Wi-Fi desconectado durante la espera de la puerta.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Perdido");
    delay(2000);
    return;
  }

  HTTPClient httpResiduo;
  String urlResiduo = SERVER_BASE_URL + "/verificar-residuo";
  httpResiduo.begin(urlResiduo);
  httpResiduo.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> docReq2;
  docReq2["codigo_producto"] = codigoResiduo;
  String body2;
  serializeJson(docReq2, body2);

  int httpCode2 = httpResiduo.POST(body2);
  if (httpCode2 > 0) {
    String payload2 = httpResiduo.getString();
    StaticJsonDocument<300> docRes2;
    deserializeJson(docRes2, payload2);

    if (!docRes2["exito"].as<bool>()) {
      Serial.println("❌ Residuo no válido en la base de datos. Reiniciando ciclo...");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Residuo No Valido");
      httpResiduo.end();
      delay(2000);
      return;
    }

    const char* nombreResiduo = docRes2["nombre_residuo"];
    int puntosValor = docRes2["puntos_valor"];
    Serial.printf("🟢 Residuo válido: %s | Valor: %d pts\n", nombreResiduo, puntosValor);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(String(nombreResiduo).substring(0, 16));
    lcd.setCursor(0, 1);
    lcd.print("Valor: " + String(puntosValor) + " pts");
    delay(2000);
  } else {
    Serial.printf("❌ Error de conexión en Paso 2. Código HTTP: %d\n", httpCode2);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error Conexion 2");
    httpResiduo.end();
    delay(2000);
    return;
  }
  httpResiduo.end();

  // -------------------------------------------------------------
  // PASO 3: Validación Física (Apertura y Cierre de Servos)
  // -------------------------------------------------------------
  Serial.println("\n⚙️ Abriendo compuerta del tacho...");
  abrirServos();
  delay(2500); 
  cerrarServos();
  Serial.println("✅ Compuerta cerrada.");

  // -------------------------------------------------------------
  // PASO 4: Registrar Reciclaje y Acreditar Puntos
  // -------------------------------------------------------------
  Serial.println("\n⏳ Registrando transacción en el servidor...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Registrando...");

  HTTPClient httpRegistro;
  String urlRegistro = SERVER_BASE_URL + "/registrar-reciclaje";
  httpRegistro.begin(urlRegistro);
  httpRegistro.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> docReq3;
  docReq3["dni"] = dni;
  docReq3["codigo_producto"] = codigoResiduo;
  String body3;
  serializeJson(docReq3, body3);

  int httpCode3 = httpRegistro.POST(body3);
  if (httpCode3 > 0) {
    String payload3 = httpRegistro.getString();
    StaticJsonDocument<300> docRes3;
    deserializeJson(docRes3, payload3);

    if (docRes3["exito"].as<bool>()) {
      int puntosGanados = docRes3["puntos_ganados"];
      Serial.println("========================================");
      Serial.printf("🎉 ¡RECICLAJE COMPLETADO CON ÉXITO!\n");
      Serial.printf("🎁 Se acreditaron %d puntos en tu cuenta.\n", puntosGanados);
      Serial.println("========================================");

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("¡RECICLAJE OK!");
      lcd.setCursor(0, 1);
      lcd.print("+" + String(puntosGanados) + " Pts Ganados");
    } else {
      Serial.println("❌ Error al registrar el reciclaje en el servidor.");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Error Servidor");
    }
  } else {
    Serial.println("❌ Error de conexión en Paso 4.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error Conexion 4");
  }
  httpRegistro.end();

  Serial.println("\n🔄 Reiniciando sistema en 3 segundos...\n");
  delay(3000);
}