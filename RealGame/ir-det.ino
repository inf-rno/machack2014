int led = D0;
int irdet = A2;
int ir = D1;

void setup() {
  pinMode(led, OUTPUT);
  pinMode(irdet, INPUT);
  pinMode(ir, OUTPUT);
}

void loop() {
  digitalWrite(led, digitalRead(irdet));
  digitalWrite(ir, HIGH);
  digitalWrite(led, digitalRead(irdet));
  delay(1000);
  digitalWrite(ir, LOW);
  digitalWrite(led, digitalRead(irdet));
  delay(1000);
}
