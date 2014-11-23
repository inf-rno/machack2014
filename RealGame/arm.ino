
Servo arm;

//PINS
int servoPin = A0;
int flowSensor = D0;



//variables
int tick = 0;
int prevValue = 0;
int realTick = 0;
int prevRealTick = realTick;
int dur = 0;
float rate = 0;
bool flow = false;
float armPos = 180;

//prototypes
bool updateFlow();

void setup()
{
    Serial.begin(9600);
    arm.attach(servoPin);  // attaches the servo on the A0 pin to the servo object
    pinMode(flowSensor, INPUT);
}

void loop(){
    bool pop = updateFlow();
    if(pop)
    {
        armPos = min(armPos + 30, 180);
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
        if(rate > 20 && !flow)
        {
            flow = true;
            return true;
        }
        else if(rate < 15 && flow) {
            flow = false;
        }
    }
    else {
        dur++;
    }

    return false;
}