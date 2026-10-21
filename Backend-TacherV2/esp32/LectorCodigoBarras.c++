#include <Arduino.h>


const int PIN_GM65_RX = 16; // Conectado al TX del GM65
const int PIN_GM65_TX = 17; // Conectado al RX del GM65


void setup() {
   Serial.begin(115200);
  
   // Configuración UART1 del ESP32
   Serial1.begin(9600, SERIAL_8N1, PIN_GM65_RX, PIN_GM65_TX);
  
   Serial.println("Sistema iniciado. Esperando lectura de DNI...");
}


void loop() {
   if (Serial1.available() > 0) {
       delay(80); // Espera a que termine de llegar la trama completa del PDF417
      
       String tramaDNI = "";
      
       while (Serial1.available() > 0) {
           char c = Serial1.read();
           if (c != '\r' && c != '\n') {
               tramaDNI += c;
           }
       }


       tramaDNI.trim();


       if (tramaDNI.length() > 0) {
           Serial.println("\n==================================================");
           Serial.print("DNI DETECTADO (Trama completa): ");
           Serial.println(tramaDNI);
           Serial.println("==================================================");
       }
   }
}
