#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// -------------------------------------------------------------
// Configuración de Red y Servidor
// -------------------------------------------------------------
const char* WIFI_SSID = "PEINE-3";
const char* WIFI_PASS = "etecPeine3";

// Backend publicado en Render (HTTPS). La versión para servidor local es CodigoFinal.c++
const char* SERVER_HOST = "backend-tacherv2.onrender.com";
const String SERVER_ROOT_URL = String("https://") + SERVER_HOST;
const String SERVER_BASE_URL = SERVER_ROOT_URL + "/api";

// Render (plan gratis) duerme el servidor si no se usa: el primer pedido puede tardar.
// Cada petición espera hasta 15 s; al arrancar se lo "despierta" con varios intentos.
const uint16_t TIMEOUT_HTTP_MS = 15000;
const int INTENTOS_DESPERTAR = 4;
// Mientras la caja espera un DNI, cada 10 minutos le hace un pedido liviano al servidor para que
// Render no lo duerma (lo duerme a los ~15 minutos sin pedidos)
const unsigned long INTERVALO_MANTENER_DESPIERTO_MS = 10UL * 60UL * 1000UL;
unsigned long ultimoPedidoServidor = 0;

// Cliente TLS para hablar con el servidor por HTTPS
WiFiClientSecure clienteSeguro;

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
// Errores de conexión (se informan por puerto serie para el técnico)
// -------------------------------------------------------------
// Devuelve true si el servidor respondió con el JSON esperado (que trae el campo "exito")
bool respuestaValida(int codigo, const String& payload, JsonDocument& doc) {
  if (codigo <= 0) return false;
  if (deserializeJson(doc, payload)) return false;
  return !doc["exito"].isNull();
}

// Explica por qué falló un pedido al servidor
void informarErrorConexion(const char* paso, int codigo) {
  Serial.printf("[ERROR] %s -> ", paso);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("SIN WI-FI. Revisar el router y el nombre/contrasena de la red.");
  } else if (codigo >= 500) {
    Serial.printf("SERVIDOR CAIDO O CON FALLAS (HTTP %d). Revisar el servicio en Render.\n", codigo);
  } else if (codigo >= 300) {
    Serial.printf("EL SERVIDOR RECHAZO EL PEDIDO (HTTP %d). Revisar la URL y el backend.\n", codigo);
  } else if (codigo > 0) {
    Serial.println("EL SERVIDOR RESPONDIO ALGO INESPERADO (no es el JSON esperado). Revisar el backend.");
  } else {
    IPAddress ip;
    if (!WiFi.hostByName(SERVER_HOST, ip)) {
      Serial.println("HAY WI-FI PERO NO HAY INTERNET (o falla el DNS). Probar internet con otro dispositivo.");
    } else if (codigo == HTTPC_ERROR_READ_TIMEOUT) {
      Serial.println("EL SERVIDOR NO RESPONDIO A TIEMPO. Si Render estaba dormido, reintentar en 1 minuto.");
    } else {
      Serial.printf("NO SE PUDO CONECTAR CON EL SERVIDOR (%s). Revisar si Render esta activo.\n",
                    HTTPClient::errorToString(codigo).c_str());
    }
  }
}

// -------------------------------------------------------------
// Conexión HTTPS con el servidor
// -------------------------------------------------------------
// Prepara una petición POST con JSON por HTTPS. setInsecure() hace que el ESP32 acepte el
// certificado de Render sin tener que cargarle el certificado raíz (la conexión sigue cifrada).
void prepararPeticion(HTTPClient& http, const String& url) {
  ultimoPedidoServidor = millis();
  clienteSeguro.setInsecure();
  http.begin(clienteSeguro, url);
  http.setConnectTimeout(TIMEOUT_HTTP_MS);
  http.setTimeout(TIMEOUT_HTTP_MS);
  http.addHeader("Content-Type", "application/json");
}

// Al arrancar, despierta al servidor de Render (puede estar dormido) para que el primer
// DNI no falle por tiempo de espera. Hace varios intentos de GET a la raíz.
void despertarServidor() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Conectando con");
  lcd.setCursor(0, 1);
  lcd.print("el servidor...");

  for (int intento = 1; intento <= INTENTOS_DESPERTAR; intento++) {
    Serial.printf("🌐 Despertando servidor (intento %d de %d)...\n", intento, INTENTOS_DESPERTAR);
    HTTPClient http;
    clienteSeguro.setInsecure();
    http.begin(clienteSeguro, SERVER_ROOT_URL + "/");
    http.setConnectTimeout(TIMEOUT_HTTP_MS);
    http.setTimeout(TIMEOUT_HTTP_MS);
    int codigo = http.GET();
    http.end();

    if (codigo == 200) {
      ultimoPedidoServidor = millis();
      Serial.println("✅ Servidor despierto y respondiendo.");
      return;
    }
    Serial.printf("⏳ Todavía no responde (código %d). Reintentando...\n", codigo);
    delay(2000);
    if (intento == INTENTOS_DESPERTAR) informarErrorConexion("Arranque", codigo);
  }
  Serial.println("⚠️ El servidor no respondió al arrancar. Si el primer DNI da error, probá de nuevo en un minuto.");
}

// Pedido corto a la raíz para que Render no duerma el servidor. Si falla, no pasa nada.
void mantenerServidorDespierto() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  clienteSeguro.setInsecure();
  http.begin(clienteSeguro, SERVER_ROOT_URL + "/");
  http.setConnectTimeout(TIMEOUT_HTTP_MS);
  http.setTimeout(TIMEOUT_HTTP_MS);
  int codigo = http.GET();
  http.end();
  ultimoPedidoServidor = millis();
  Serial.printf("💓 Servidor mantenido despierto (código %d)\n", codigo);
  if (codigo != 200) informarErrorConexion("Mantener despierto", codigo);
}

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
// Control de la puerta (anti-trampa)
// -------------------------------------------------------------
// HIGH = abierta. Se lee dos veces para no confundir un ruido con una apertura.
bool puertaAbierta() {
  if (digitalRead(PIN_REED_SWITCH) == LOW) return false;
  delay(20);
  return digitalRead(PIN_REED_SWITCH) == HIGH;
}

// Reemplaza a delay(): espera revisando la puerta. Devuelve false si se abrió.
bool esperarConPuertaCerrada(unsigned long ms) {
  unsigned long inicio = millis();
  while (millis() - inicio < ms) {
    if (puertaAbierta()) return false;
    delay(10);
  }
  return true;
}

// Cancela el reciclaje porque se abrió la puerta
void cancelarPorPuerta() {
  cerrarServos();
  Serial.println("❌ ¡Se abrió la puerta! Reciclaje cancelado.");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Puerta Abierta!");
  lcd.setCursor(0, 1);
  lcd.print("Cancelado");
  delay(3000);
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

    // Mientras nadie escanea, evita que el servidor de Render se duerma
    if (millis() - ultimoPedidoServidor > INTERVALO_MANTENER_DESPIERTO_MS) {
      mantenerServidorDespierto();
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

  // "Deposita Tu residuo" -> 2 segundos -> "Cierra la puerta"
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Deposita Tu");
  lcd.setCursor(0, 1);
  lcd.print("residuo");
  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Cierra la puerta");

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
        lcd.print("Cierra la puerta");
        lcd.setCursor(0, 1);
        lcd.print("por favor");
        delay(2000);

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Cierra la puerta");
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
    if (puertaAbierta()) {
      cancelarPorPuerta();
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

  if (puertaAbierta()) {
    cancelarPorPuerta();
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
  despertarServidor();
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
  prepararPeticion(httpDni, urlDni);

  StaticJsonDocument<200> docReq1;
  docReq1["dni"] = dni;
  String body1;
  serializeJson(docReq1, body1);

  int httpCode1 = httpDni.POST(body1);
  String payload1 = "";
  if (httpCode1 > 0) payload1 = httpDni.getString();
  httpDni.end();

  StaticJsonDocument<300> docRes1;
  if (!respuestaValida(httpCode1, payload1, docRes1)) {
    informarErrorConexion("Paso 1 (verificar DNI)", httpCode1);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error de Conexion");
    delay(2000);
    return;
  }

  if (!docRes1["exito"].as<bool>()) {
    Serial.println("❌ Usuario no registrado. Reiniciando ciclo...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Usuario no");
    lcd.setCursor(0, 1);
    lcd.print("Registrado");
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

  // -------------------------------------------------------------
  // PASO 2: Control estricto anti-trampa (Depositar -> Cerrar puerta -> Escanear)
  // Desde que la puerta se cierra hasta que los servos se cierran, si la puerta
  // se abre se cancela todo y no se registra nada en el servidor.
  // -------------------------------------------------------------
  String codigoResiduo = obtenerResiduoEstrictoAntiTrampa();

  if (codigoResiduo.length() == 0) {
    Serial.println("🔄 Ciclo abortado. Reiniciando...\n");
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
  if (!esperarConPuertaCerrada(3000)) {
    cancelarPorPuerta();
    return;
  }

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
  prepararPeticion(httpResiduo, urlResiduo);

  StaticJsonDocument<200> docReq2;
  docReq2["codigo_producto"] = codigoResiduo;
  String body2;
  serializeJson(docReq2, body2);

  int httpCode2 = httpResiduo.POST(body2);
  String payload2 = "";
  if (httpCode2 > 0) payload2 = httpResiduo.getString();
  httpResiduo.end();

  // Si la puerta se abrió mientras se esperaba al servidor, se cancela
  if (puertaAbierta()) {
    cancelarPorPuerta();
    return;
  }

  StaticJsonDocument<300> docRes2;
  if (!respuestaValida(httpCode2, payload2, docRes2)) {
    informarErrorConexion("Paso 2 (verificar residuo)", httpCode2);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error Conexion 2");
    delay(3000);
    return;
  }

  if (!docRes2["exito"].as<bool>()) {
    Serial.println("❌ Residuo no válido en la base de datos. Reiniciando ciclo...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Residuo No Valido");
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
  if (!esperarConPuertaCerrada(2000)) {
    cancelarPorPuerta();
    return;
  }
  lcd.clear();
  lcd.print(nombreResiduo.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print("Valor: " + String(puntosValor) + "pts");
  if (!esperarConPuertaCerrada(2500)) {
    cancelarPorPuerta();
    return;
  }

  // -------------------------------------------------------------
  // PASO 4: Registrar Reciclaje y Acreditar Puntos
  // -------------------------------------------------------------
  Serial.println("\n⏳ Registrando transacción en el servidor...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Reciclando...");
  if (!esperarConPuertaCerrada(1000)) {
    cancelarPorPuerta();
    return;
  }

  // -------------------------------------------------------------
  // PASO 3: Validación Física (Apertura y Cierre de Servos)
  // -------------------------------------------------------------
  Serial.println("\n⚙️ Abriendo compuerta del tacho...");
  abrirServos();
  if (!esperarConPuertaCerrada(2000)) {
    cancelarPorPuerta();  // también cierra los servos
    return;
  }
  cerrarServos();
  Serial.println("✅ Compuerta cerrada.");

  if (puertaAbierta()) {
    cancelarPorPuerta();
    return;
  }

  HTTPClient httpRegistro;
  String urlRegistro = SERVER_BASE_URL + "/registrar-reciclaje";
  prepararPeticion(httpRegistro, urlRegistro);

  StaticJsonDocument<200> docReq3;
  docReq3["dni"] = dni;
  docReq3["codigo_producto"] = codigoResiduo;
  String body3;
  serializeJson(docReq3, body3);

  int httpCode3 = httpRegistro.POST(body3);
  String payload3 = "";
  if (httpCode3 > 0) payload3 = httpRegistro.getString();
  httpRegistro.end();

  // Ampliamos el tamaño del documento JSON para recibir los puntos totales de forma segura
  StaticJsonDocument<400> docRes3;
  if (!respuestaValida(httpCode3, payload3, docRes3)) {
    informarErrorConexion("Paso 4 (registrar reciclaje)", httpCode3);
    // El residuo ya cayó: se dejan los datos para acreditar los puntos a mano
    Serial.printf("[ERROR] Puntos sin acreditar -> DNI: %s | Codigo: %s\n", dni.c_str(), codigoResiduo.c_str());
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Error Conexion 4");
  } else if (docRes3["exito"].as<bool>()) {
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

  Serial.println("\n🔄 Reiniciando sistema en 3 segundos...");
  delay(3000);
}
