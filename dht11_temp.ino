#include <DHT.h>

#define DHTPIN 2           // Broche à laquelle le capteur est connecté
#define DHTTYPE DHT11      // Définir le type de capteur (DHT11 dans ce cas)

DHT dht(DHTPIN, DHTTYPE); // Initialiser le capteur DHT

void setup() {
  Serial.begin(9600);   // Initialiser la communication série
  dht.begin();          // Initialiser le capteur DHT11
}

void loop() {
  float t = dht.readTemperature(); // Lire la température
  if (!isnan(t)) {  // Vérifier si la température est valide
    Serial.println(t); // Afficher la température dans le moniteur série
  }
  delay(3000);  // Attendre 3 secondes avant de lire à nouveau
}
