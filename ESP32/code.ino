#include "DHT.h"
#include <WiFi.h>
#include <HTTPClient.h>


#define DHTPIN 18
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE); 

int fotorezystor = 34;
int gleba = 35;
int przekaz = 32;
int plywak = 22;
int stan = 0;
float minWilgotnosc = -1;
bool pod = 0;

const char* ssid = "";
const char* password = "";
const char* backendUrl = "http://192.168.1.114:8000/api/pomiar/";

const char* device_id = "esp32-test";

void setup() {
  pinMode(fotorezystor, INPUT);
  pinMode(gleba, INPUT);
  pinMode(przekaz, OUTPUT);
  pinMode(plywak, INPUT_PULLUP);
  digitalWrite(przekaz, HIGH);
  Serial.begin(115200);
  dht.begin();
  WiFi.mode(WIFI_STA);
  
  WiFi.begin(ssid, password);
  Serial.print("Laczenie z Wi-Fi");

  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
    Serial.println(WiFi.status());
  }
  Serial.println();
  Serial.print("Połączono! Adres IP: ");
  Serial.println(WiFi.localIP());


}

void loop() {
  pod = 0;
  delay(5000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float f = dht.readTemperature(true);

  float swiatlo = analogRead(fotorezystor);
  float wartosc = (swiatlo/4095) * 100;
  wartosc = 100 - wartosc;

  float wilgotnosc = analogRead(gleba);
  float wartoscg = (wilgotnosc/4095) * 100;

  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println("brak polaczenia");
    return;
  }

  stan = digitalRead(plywak);
  bool podlewane = 0;

  if(stan == LOW){
    Serial.println("JEST WODA!");
    podlewane = 0;
  }
  else{
    Serial.println("NIE MA WODY!");
    podlewane = 1;
  }  
  

  fetchMinWilgotnosc();
  Serial.println("---- POMIAR ----");
  Serial.printf("Wilg. powietrza: %.2f %%\n", h);
  Serial.printf("Temp: %.2f °C\n", t);
  Serial.printf("Nasłonecznienie: %.2f %%\n", wartosc);
  Serial.printf("Wilg. gleby: %.2f %%\n", wartoscg);
  Serial.printf("Podlewane: %s\n", podlewane ? "TAK" : "NIE");
  
    

  if(wartoscg < minWilgotnosc){
    pod = 1;
    digitalWrite(przekaz, LOW);
    delay(500);
    digitalWrite(przekaz, HIGH);
  }

  sendDataToBackend(t, h, wartosc, wartoscg, pod);

  delay(10000);  

  

}


void sendDataToBackend(float temp, float wilg_p, float naslon, float wilg_g, bool czy_podlewane) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(backendUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"device_id\":\"" + String(device_id) + "\",";
    json += "\"temperatura\":" + String(temp) + ",";
    json += "\"wilgotnosc_powietrza\":" + String(wilg_p) + ",";
    json += "\"naslonecznienie\":" + String(naslon) + ",";
    json += "\"wilgotnosc_gleby\":" + String(wilg_g) + ",";
    json += "\"czy_podlewane\":" + String(czy_podlewane ? "true" : "false");
    json += "}";

    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
      Serial.print(" Wysłano pomiar. Kod odpowiedzi: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print(" Błąd wysyłania. Kod błędu: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println(" Brak połączenia z Wi-Fi");
  }
}

void fetchMinWilgotnosc() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://192.168.1.114:8000/api/device/esp32-test/settings/";  
    http.begin(url);

    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String response = http.getString();
      Serial.println(" Odpowiedź z backendu:");
      Serial.println(response);

      int idx = response.indexOf("min_wilgotnosc");
      if (idx != -1) {
        int colon = response.indexOf(":", idx);
        int comma = response.indexOf(",", colon);
        if (comma == -1) comma = response.indexOf("}", colon);
        String valueStr = response.substring(colon + 1, comma);
        minWilgotnosc = valueStr.toFloat();
        Serial.print(" Pobrano min. wilgotność: ");
        Serial.println(minWilgotnosc);
      }
    } else {
      Serial.print(" Błąd pobierania min_wilgotnosc: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
}

