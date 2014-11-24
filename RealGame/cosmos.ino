int leds[][2] = {
                {A0, D0},
                {A1, D1},
                {A2, D2}
                };
int prevIndex = 0;

void lightRandom();

void setup() {
  for(int i = 0; i < 3; i ++)
  {
    pinMode(leds[i][0], OUTPUT);
    pinMode(leds[i][1], OUTPUT);
  }
}

void loop() {
  lightRandom();
  delay(5000);
}

void lightRandom() {
  digitalWrite(leds[prevIndex][0], LOW);
  digitalWrite(leds[prevIndex][1], LOW);
  prevIndex = random(3);
  // prevIndex = 1;
  digitalWrite(leds[prevIndex][0], HIGH);
  digitalWrite(leds[prevIndex][1], HIGH);
}