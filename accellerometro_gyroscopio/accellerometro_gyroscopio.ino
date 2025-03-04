#include <LSM6DS3.h>
#include <Wire.h>

// Crea un'istanza della classe LSM6DS3
LSM6DS3 myIMU(I2C_MODE, 0x6A);    // Indirizzo I2C 0x6A
float aX, aY, aZ, gX, gY, gZ;
const float accelerationThreshold = 2.5; // Soglia per il movimento significativo (in G)
const int numSamples = 119;              // Numero di campioni da acquisire dopo il movimento significativo
int samplesRead = numSamples;            // Variabile di controllo per il conteggio dei campioni

void setup() {
  Serial.begin(9600);
  while (!Serial); // Attendi l'apertura della Serial Monitor, utile per alcune board

  // Inizializza il sensore LSM6DS3
  if (myIMU.begin() != 0) {
    Serial.println("Device error");
  } else {
    // Stampa l'intestazione CSV per i dati
    Serial.println("aX,aY,aZ,gX,gY,gZ");
  }
}

void loop() {
  // Attendi il rilevamento di un movimento significativo
  while (samplesRead == numSamples) {
    // Leggi i dati dell'accelerometro
    aX = myIMU.readFloatAccelX();
    aY = myIMU.readFloatAccelY();
    aZ = myIMU.readFloatAccelZ();

    // Calcola la somma degli assoluti
    float aSum = fabs(aX) + fabs(aY) + fabs(aZ);

    // Se il movimento supera la soglia, inizia la raccolta dei campioni
    if (aSum >= accelerationThreshold) {
      samplesRead = 0;
      break;
    }
  }

  // Acquisisci numSamples campioni dopo il rilevamento del movimento
  while (samplesRead < numSamples) {
    samplesRead++;

    // Leggi e stampa i dati in formato CSV:
    // Accelerometro (X, Y, Z) e Giroscopio (X, Y, Z) con 3 cifre decimali
    Serial.print("AccelX : " + String(myIMU.readFloatAccelX(), 3));
    Serial.print('||');
    Serial.print("AccelY : " + String(myIMU.readFloatAccelY(), 3));
    Serial.print('||');
    Serial.print(myIMU.readFloatAccelZ(), 3);
    Serial.print('||');
    Serial.print(myIMU.readFloatGyroX(), 3);
    Serial.print('||');
    Serial.print(myIMU.readFloatGyroY(), 3);
    Serial.print('||');
    Serial.print(myIMU.readFloatGyroZ(), 3);
    Serial.println();

    // Aggiunge una riga vuota al termine della serie di campioni
    if (samplesRead == numSamples) {
      Serial.println();
    }
  }
}