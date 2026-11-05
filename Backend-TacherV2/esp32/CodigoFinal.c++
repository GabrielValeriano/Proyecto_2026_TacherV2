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
  servoDerecho.write(90);
  servoIzquierdo.write(180);
}

void cerrarServos() {
  Serial.println(">>> Posicionando servomotores en reposo (Cerrados)...");
  servoDerecho.write(110);
  servoIzquierdo.write(110);
}

// -------------------------------------------------------------
// Función para extraer y validar estrictamente el DNI
// -------------------------------------------------------------
String extraerDNIValido(String rawData) {
  rawData.trim();
  if (rawData.length() == 0) return "";

  if (rawData.indexOf('@') >= 0) {
    int indice = 0;
    String campos[12];
    
    while (rawData.length() > 0 && indice < 12) {
      int posAt = rawData.indexOf('@');
      if (posAt != -1) {
        campos[indice] = rawData.substring(0, posAt);
        rawData = rawData.substring(posAt + 1);
      } else {
        campos[indice] = rawData;
        rawData = "";
      }
      indice++;
    }

    if (indice > 4) {
      String dniCandidate = campos[4];
      dniCandidate.trim();
      
      String dniLimpio = "";
      for (int i = 0; i < dniCandidate.length(); i++) {
        if (isdigit(dniCandidate.charAt(i))) dniLimpio += dniCandidate.charAt(i);
      }
      
      if (dniLimpio.length() >= 7 && dniLimpio.length() <= 8) {
        return dniLimpio;
      }
    }
  }

  String dniLimpio = "";
  for (int i = 0; i < rawData.length(); i++) {
    if (isDigit(rawData.charAt(i))) {
      dniLimpio += rawData.charAt(i);
    }
  }

  if (dniLimpio.length() >= 7 && dniLimpio.length() <= 8) {
    return dniLimpio;
  }

  return ""; 
}

// -------------------------------------------------------------
// Función para leer y validar DNI
// -------------------------------------------------------------
String leerDNI() {
  while (Serial1.available() > 0) Serial1.read();
  while (Serial.available() > 0) Serial.read();

  String datoCrudo = "";
  while (true) {
    if (Serial1.available() > 0) {
      delay(80); 
      while (Serial1.available() > 0) {
        char c = Serial1.read();
        if (c != '\r' && c != '\n') datoCrudo += c;
      }
      datoCrudo.trim();
      if (datoCrudo.length() > 0) break;
    }
    
    if (Serial.available() > 0) {
      String temp = Serial.readStringUntil('\n');
      temp.trim();
      if (temp.length() > 0) {
        datoCrudo = temp;
        break;
      }
    }
    delay(10);
  }

  datoCrudo.trim();
  String dniFinal = extraerDNIValido(datoCrudo);

  Serial.print("📄 Texto crudo escaneado: ");
  Serial.println(datoCrudo);
  Serial.print("🎯 DNI Procesado: ");
  Serial.println(dniFinal);

  return dniFinal;
}

// -------------------------------------------------------------
// Función Estricta Anti-Trampa (Residuo con mensaje "Cierre la puerta")
// -------------------------------------------------------------
String obtenerResiduoEstrictoAntiTrampa() {
  String codigoEscaneado = "";

  Serial.println("\n==================================================");
  Serial.println("📦 PASO 2: CIERRE LA PUERTA PRIMERO");
  Serial.println("==================================================");

  // Mostrar mensaje inicial en LCD pidiendo cerrar la puerta si está abierta
  bool puertaAbiertaInicial = (digitalRead(PIN_REED_SWITCH) == HIGH);
  if (puertaAbiertaInicial) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Escanee Residuo");
    lcd.setCursor(0, 1);
    lcd.print("Cierre la puerta");
  }

  // 1. ESPERAR A QUE LA PUERTA ESTÉ CERRADA (LOW = Cerrada)
  while (true) {
    bool puertaAbierta = (digitalRead(PIN_REED_SWITCH) == HIGH);
    if (puertaAbierta) {
      // Si escanean cualquier cosa o intentan operar con la puerta abierta
      if (Serial1.available() > 0 || Serial.available() > 0) {
        // Limpiamos los rastros para que no procese basura
        while (Serial1.available() > 0) Serial1.read();
        while (Serial.available() > 0) Serial.read();

        Serial.println("⚠️ Intento con puerta abierta. Mostrando aviso en LCD.");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Cierre la puerta");
        lcd.setCursor(0, 1);
        lcd.print("por favor");
        delay(2000);

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Escanee Residuo");
        lcd.setCursor(0, 1);
        lcd.print("Cierre la puerta");
      }
      delay(50);
      continue;
    } else {
      break; // Puerta cerrada confirmada
    }
  }

  // 2. Limpiar búfer al cerrar la puerta
  delay(150); 
  while (Serial1.available() > 0) Serial1.read();
  while (Serial.available() > 0) Serial.read();

  Serial.println("✅ Puerta cerrada. Búfer limpio. Escanee el residuo ahora...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Escaneando el");
  lcd.setCursor(0, 1);
  lcd.print("Residuo ingresado");

  unsigned long tiempoInicio = millis();

  // 3. ESCANEAR ÚNICAMENTE CON LA PUERTA CERRADA
  while (true) {
    if (digitalRead(PIN_REED_SWITCH) == HIGH) {
      Serial.println("❌ ¡Se abrió la puerta! Reciclaje cancelado.");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Puerta Abierta!");
      lcd.setCursor(0, 1);
      lcd.print("Cancelado");
      delay(3000);
      return ""; 
    }

    // Leer escáner físico (Serial1)
    if (Serial1.available() > 0) {
      delay(80);
      String tempDato = "";
      while (Serial1.available() > 0) {
        char c = Serial1.read();
        if (c != '\r' && c != '\n') tempDato += c;
      }
      tempDato.trim();
      if (tempDato.length() > 0) {
        codigoEscaneado = tempDato;
        Serial.print("👉 Código de residuo capturado correctamente: ");
        Serial.println(codigoEscaneado);
        break; 
      }
    }

    // Leer entrada manual por consola
    if (Serial.available() > 0) {
      String tempDato = Serial.readStringUntil('\n');
      tempDato.trim();
      if (tempDato.length() > 0) {
        codigoEscaneado = tempDato;
        Serial.print("👉 Código manual capturado: ");
        Serial.println(codigoEscaneado);
        break;
      }
    }

    if (millis() - tiempoInicio > 30000) {
      Serial.println("⏱️ Tiempo de espera agotado.");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Tiempo agotado");
      delay(2000);
      return "";
    }

    delay(50);
  }

  if (digitalRead(PIN_REED_SWITCH) == HIGH) {
    Serial.println("❌ Se abrió la puerta inmediatamente después de escanear. Cancelado.");
    lcd.clear();
    delay(2000);
    return "";
  }

  return codigoEscaneado;
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
  lcd.print("TacherV2");
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
  Serial.println("🚀 Sistema TACHER V4 Estricto Listo.");

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

  // TEXTO POR DEFAULT (Cuando no se está usando)
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TacherV2");
  lcd.setCursor(0, 1);
  lcd.print("Reciclar Mejor");
  delay(1500);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Escanea tu DNI");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Error: Sin conexión Wi-Fi. Esperando reconexión...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sin conexion WiFi");
    delay(2000);
    return;
  }

  // -------------------------------------------------------------
  // PASO 1: Ingresar y verificar DNI
  // -------------------------------------------------------------
  Serial.println("👉 Escanee su DNI (o ingréselo por teclado):");

  String dni = leerDNI();

  if (dni.length() == 0) {
    Serial.println("❌ DNI incorrecto. Se escaneó un código inválido.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("DNI incorrecto");
    lcd.setCursor(0, 1);
    lcd.print("Reintentar...");
    delay(2500);
    return; 
  }

  Serial.print("📄 DNI Detectado: ");
  Serial.println(dni);

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

    String nombreUsuario = docRes1["nombre"].as<String>();
    Serial.printf("🟢 ¡Bienvenido, %s!\n", nombreUsuario.c_str());
    
    // TEXTO AL RECONOCER DNI
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Bienvenido");
    lcd.setCursor(0, 1);
    lcd.print(nombreUsuario.substring(0, 16));
    delay(2000);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Escanea Residuo");

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
  // PASO 2: Control estricto anti-trampa (Cerrar puerta -> Escanear)
  // -------------------------------------------------------------
  String codigoResiduo = obtenerResiduoEstrictoAntiTrampa();
  
  if (codigoResiduo.length() == 0) {
    Serial.println("🔄 Ciclo abortado por apertura de puerta. Reiniciando...\n");
    delay(1000);
    return; 
  }

  Serial.print("📦 Código de Residuo a Verificar: ");
  Serial.println(codigoResiduo);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Validando");
  lcd.setCursor(0, 1);
  lcd.print("Residuo...");
  delay(3000);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Wi-Fi desconectado.");
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
      delay(5000);
      return;
    }

    String nombreResiduo = docRes2["nombre_residuo"].as<String>();
    int puntosValor = docRes2["puntos_valor"];
    Serial.printf("🟢 Residuo válido: %s | Valor: %d pts\n", nombreResiduo.c_str(), puntosValor);

    // TEXTO AL RECONOCER EL RESIDUO
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Residuo");
    lcd.setCursor(0,1);
    lcd.print("!Identificado!");
    delay(2000);
    lcd.clear();
    lcd.print(nombreResiduo.substring(0, 16));
    lcd.setCursor(0, 1);
    lcd.print("Valor: " + String(puntosValor) + "pts");
    delay(2500);
  } else {
    Serial.printf("❌ Error de conexión en Paso 2. Código HTTP: %d\n", httpCode2);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error Conexion 2");
    httpResiduo.end();
    delay(3000);
    return;
  }
  httpResiduo.end();

  // -------------------------------------------------------------
  // PASO 4: Registrar Reciclaje y Acreditar Puntos
  // -------------------------------------------------------------
  Serial.println("\n⏳ Registrando transacción en el servidor...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Reciclando...");
  delay(1000);
  
  // -------------------------------------------------------------
  // PASO 3: Validación Física (Apertura y Cierre de Servos)
  // -------------------------------------------------------------
  Serial.println("\n⚙️ Abriendo compuerta del tacho...");
  abrirServos();
  delay(2000); 
  cerrarServos();
  Serial.println("✅ Compuerta cerrada.");

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
    
    // Ampliamos el tamaño del documento JSON para recibir los puntos totales de forma segura
    StaticJsonDocument<400> docRes3;
    deserializeJson(docRes3, payload3);

    if (docRes3["exito"].as<bool>()) {
      int puntosGanados = docRes3["puntos_ganados"];
      int puntosTotales = docRes3["puntos_totales"]; // Asegurate de que tu backend mande esto

      Serial.println("========================================");
      Serial.printf("🎉 ¡RECICLAJE COMPLETADO CON ÉXITO!\n");
      Serial.printf("🎁 Se acreditaron %d puntos en tu cuenta. Total: %d\n", puntosGanados, puntosTotales);
      Serial.println("========================================");

      // TEXTO FINAL REQUERIDO EN EL LCD
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Ganaste: " + String(puntosGanados) + "pts");
      lcd.setCursor(0, 1);
      lcd.print("Puntos Totales:" + String(puntosTotales));
      delay(4000); // Mostramos los puntos unos segundos más
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