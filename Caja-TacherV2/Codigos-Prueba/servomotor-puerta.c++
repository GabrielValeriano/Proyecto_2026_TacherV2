#include <Arduino.h>
#include <ESP32Servo.h>


// --- Definición de Pines ---
const int PIN_REED_SWITCH = 12; // Cambiado a GPIO12 (puedes cambiarlo al pin que te quede cómodo)
const int PIN_IZQ = 14;         // GPIO14 (Servo Izquierdo)
const int PIN_DER = 27;         // GPIO27 (Servo Derecho)


// --- Objetos Servo ---
Servo servoIzquierdo;
Servo servoDerecho;


// --- Estado del Sensor ---
bool estadoAnterior = HIGH;


// Función para abrir la trampa de servomotores
void abrirServos() {
 Serial.println(">>> Puerta CERRADA -> Abriendo servomotores (AFUERA)");
 servoDerecho.write(90);
 servoIzquierdo.write(180);
}


// Función para ajustar los servomotores
void ajustarServos() {
 Serial.println(">>> Puerta ABIERTA -> Posicionando servomotores al CENTRO");
 servoDerecho.write(10);
 servoIzquierdo.write(110);
}


void setup() {
 Serial.begin(115200);


 // Configuración del sensor Reed Switch con PULLUP interna
 pinMode(PIN_REED_SWITCH, INPUT_PULLUP);


 // Configuración de Servomotores
 servoDerecho.attach(PIN_DER, 500, 2400);
 servoIzquierdo.attach(PIN_IZQ, 500, 2400);


 // Lectura del estado inicial del sensor
 estadoAnterior = digitalRead(PIN_REED_SWITCH);
 Serial.println("--- Inicio del Sistema TACHER V2 ---");


 if (estadoAnterior == LOW) {
   Serial.println("Estado inicial: Puerta CERRADA");
   abrirServos();
 } else {
   Serial.println("Estado inicial: Puerta ABIERTA");
   ajustarServos();
 }
}


void loop() {
 bool estadoActual = digitalRead(PIN_REED_SWITCH);


 // Detectar cambio de estado en la puerta
 if (estadoActual != estadoAnterior) {
   delay(50); // Filtro antirrebote


   if (estadoActual == LOW) {
     Serial.println("\n[EVENTO] PUERTA CERRADA");
     abrirServos();
   } else {
     Serial.println("\n[EVENTO] PUERTA ABIERTA");
     ajustarServos();
   }


   estadoAnterior = estadoActual;
 }


 delay(100);
}

