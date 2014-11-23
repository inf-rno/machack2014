int led = D0;
int ir = A2;


void setup() {
  pinMode(led, OUTPUT);
  pinMode(ir, INPUT);
}

void loop() {
  digitalWrite(led, digitalRead(ir));
}
