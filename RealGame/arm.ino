
Servo arm;
Servo mapS;

//PINS
int servoPin = A0;
int flowSensor = D0;
int mapServorPin = A1;
int spkPin = D1;


//variables
int tick = 0;
int prevValue = 0;
int realTick = 0;
int prevRealTick = realTick;
int dur = 0;
float rate = 0;
bool flow = false;
float armPos = 180;
int maxRate = 0;
int irdet = A2;


//  digitalWrite(led, digitalRead(irdet));

//prototypes
bool updateFlow();
void playBippidiBoop();

void setup()
{
    Serial.begin(9600);
    arm.attach(servoPin);  // attaches the servo on the A0 pin to the servo object
    mapS.attach(mapServorPin);
    pinMode(flowSensor, INPUT);
    pinMode(irdet, INPUT);
    pinMode(spkPin, OUTPUT);
    mapS.write(60);
}

void loop(){
    bool pop = updateFlow();
    if(pop)
    {
        armPos = min(armPos + 20, 180);
        playBippidiBoop();
        Serial.print("pop");
        Serial.println(armPos);

    }
    if(armPos>90)
        armPos-=0.15;

    arm.write(armPos);
}

bool updateFlow()
{
    int value = digitalRead(flowSensor);

    if(value != prevValue) {
        tick++;
        prevValue = value;
        if(tick%20 == 0) {
            realTick++;
            // Serial.print("realTick");
            // Serial.println(realTick);
        }
    }

    if(realTick != prevRealTick) {
        prevRealTick = realTick;
        rate = 1000.0/dur;
        dur=0;

        Serial.println(rate);

        if(!flow)
        {
            if(rate > maxRate * 1.1)
            {
                flow = true;
                maxRate = rate;
                return true;
            }
        }
        else {
            if(rate > maxRate)
                maxRate = rate;
            if(rate < maxRate * .9 || rate < 15) {
                flow = false;
                maxRate = rate;
            }
        }
    }
    else {
        dur++;
    }

    return false;
}

void playBippidiBoop() {
    tone(spkPin, 2112,200);
    delay(200);
    noTone(spkPin);
}