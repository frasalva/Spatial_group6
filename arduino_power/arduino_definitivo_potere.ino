#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LSM6DS3.h>
#include <Wire.h>

LSM6DS3 myIMU(I2C_MODE, 0x6A);
float gX, gY, gZ;

// Variabili per controllare frequenza di campionamento e invio
unsigned long lastSampleTime = 0;
unsigned long lastSendTime = 0;
const unsigned long sampleInterval = 10;  // ms tra letture del sensore
const unsigned long sendInterval = 100;   // ms tra invii al database (ridotto per maggiore reattività)

// Configurazione WiFi
// const char* ssid = "TP-Link_CA8E";
// const char* password = "22327000";

const char* ssid = "Samsung hotspot";
const char* password = "dydo2002";

// Supabase credentials
#define supabaseUrl "https://obglvvzwmypfrfltofgr.supabase.co"
#define supabaseKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ2x2dnp3bXlwZnJmbHRvZmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODg5MDYsImV4cCI6MjA1NzI2NDkwNn0.0kv9_bL5lLibR7Y4Ui6fUIq43MekqHNXAcKyIps2HMA"
#define tableName "scritturagiroacc"

// Client HTTP riutilizzabile
HTTPClient http;
bool isHttpInitialized = false;

void setup() {
  Serial.begin(115200);
  
  // Connessione WiFi con timeout
  WiFi.begin(ssid, password);
  
  int wifiTimeout = 0;
  while (WiFi.status() != WL_CONNECTED && wifiTimeout < 20) {
    delay(500);
    Serial.print(".");
    wifiTimeout++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected.");
    Serial.println("IP address: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nFailed to connect to WiFi. Check credentials.");
  }
  
  // Inizializzazione sensore
  sensorInizialization();
  
  // Inizializzazione HTTP una volta sola
  initializeHttp();
}

void loop() {
  unsigned long currentTime = millis();

  // Lettura sensore all'intervallo specificato
  if (currentTime - lastSampleTime >= sampleInterval) {
    lastSampleTime = currentTime;
    sensorReading();
  }
  
  // Invio dati all'intervallo specificato
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    sendData();
  }
  
  // Piccolo delay per evitare di sovraccaricare il processore
  yield();
}

void sensorInizialization() {
  if (myIMU.begin() != 0) {
    Serial.println("Gyro error");
  } else {
    Serial.println("Gyro initialized");
  }
}

void sensorReading() {
  // Ridotto a 10 letture per media per essere più reattivo
  int countX = 10;
  float rawX = 0;
  for (int i = 0; i < countX; i++) rawX += myIMU.readFloatAccelX();
  gX = rawX / countX;

  int countY = 10;
  float rawY = 0;
  for (int i = 0; i < countY; i++) rawY += myIMU.readFloatAccelY();
  gY = rawY / countY;

  int countZ = 10;
  float rawZ = 0;
  for (int i = 0; i < countZ; i++) rawZ += myIMU.readFloatAccelZ();
  gZ = rawZ / countZ;

  // Solo per debug - commenta per aumentare performance
  //Serial.print("GyroX: " + String(gX, 2));
  //Serial.print("  ||  GyroY: " + String(gY, 2));
  //Serial.print("  ||  GyroZ: " + String(gZ, 2));
  //Serial.println();
}

void initializeHttp() {
  String endpoint = String(supabaseUrl) + "/rest/v1/" + tableName + "?id=eq.3";
  http.begin(endpoint);
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + String(supabaseKey));
  http.addHeader("Prefer", "return=representation");
  
  isHttpInitialized = true;
}

void sendData() {
  // Verifica connessione WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.reconnect();
    
    // Timeout per riconnessione
    int timeout = 0;
    while (WiFi.status() != WL_CONNECTED && timeout < 10) {
      delay(300);
      timeout++;
    }
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Failed to reconnect to WiFi. Skipping data send.");
      return;
    }
    
    // Re-inizializza HTTP dopo riconnessione
    http.end();
    initializeHttp();
  }
  
  // Prepara i dati JSON in modo più efficiente
  String jsonString = "{\"values\":{\"e\":\"" + String(gX, 2) + 
                      "\",\"f\":\"" + String(gY, 2) + 
                      "\",\"g\":\"" + String(gZ, 2) + "\"}}";
  
  // Invia i dati
  int httpResponseCode = http.PATCH(jsonString);
  
  // Gestione risposta minimale per essere più veloci
  if (httpResponseCode <= 0) {
    Serial.print("HTTP error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  // Non chiudere la connessione HTTP per riutilizzarla
  // http.end(); // Commentato per mantenere la connessione aperta
}