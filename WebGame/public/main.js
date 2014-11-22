var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv');

var FLOW_TO_ACCEL_MULTIPLIER = 15;
var WORLD_WIDTH = 1024;
var WORLD_HEIGHT = 800;

function capVelocity(value)
{ 
	return Math.min(300, Math.max(-300, value));
}

function capAcceleration(value)
{
	return Math.min(0, Math.max(-2000, value));	
}

var world;
var mainState = {

    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/bird.png');  
        game.load.image('pipe', 'assets/pipe.png'); 

        // Load the jump sound
        game.load.audio('jump', 'assets/jump.wav');     
    },

    create: function() {
		world = this;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        world.pipes = game.add.group();
        world.pipes.enableBody = true;
        world.pipes.createMultiple(20, 'pipe');  
        world.timer = world.game.time.events.loop(3500, world.addRowOfPipes, world);           
		
		
        world.bird = world.game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(world.bird);
        world.bird.body.gravity.y = 500; 
		world.bird.body.width = 30;
		world.bird.body.height = 30;
		world.bird.body.offset.x = 10;
		world.bird.body.offset.y = 10;

        // New anchor position
        world.bird.anchor.setTo(-0.2, 0.5); 
 
        var spaceKey = world.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(world.jump, world); 

        world.score = 0;
        world.labelScore = world.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  

        // Add the jump sound
        world.jumpSound = world.game.add.audio('jump');
    },

	update: function() {
        //if (world.bird.inWorld == false)
        //    world.restartGame(); 
		
		if (world.bird.y < 0){world.bird.y = WORLD_HEIGHT-50;}
		if (world.bird.y > WORLD_HEIGHT - 50){world.bird.y = 0;}

        game.physics.arcade.overlap(world.bird, world.pipes, world.hitCoin, null, world); 
		
        // Slowly rotate the bird downward, up to a certain point.
		var dy = world.bird.body.velocity.y;
		var dy = capVelocity(dy);
		world.bird.body.velocity.y = dy;
		
		var dy = dy / 400;
		
		var targetAngle = Math.round(dy * 75);
		var da = world.bird.angle - targetAngle;
       if (da != 0)
	   {
		  if (Math.abs(da) > 4)
		  {
	       if (da>0)
		   {world.bird.angle-=4;}
		   else
		   {world.bird.angle+=4;}
		   }
		   else
		   {
		   if (da>0)
		   {world.bird.angle-=1;}
		   else
		   {world.bird.angle+=1;}
		   
		   }
		}		   
    },

    jump: function() {
        // If the bird is dead, he can't jump
        if (world.bird.alive == false)
            return; 

        world.bird.body.velocity.y = -350;

        // Jump animation
        game.add.tween(world.bird).to({angle: -20}, 100).start();

        // Play sound
        world.jumpSound.play();
    },
	flap:function(howMuch)
	{
		if (howMuch != 0  && world.bird.alive)
		{
			var currentAcceleration = capAcceleration(world.bird.body.acceleration.y);
			var newAcceleration = capAcceleration(0 - (howMuch*FLOW_TO_ACCEL_MULTIPLIER));
			world.bird.body.acceleration.y = newAcceleration;
		}
	},
	
	hitCoin: function(bird, coin) {
	    world.score += 1;
        world.labelScore.text = world.score; 
		
		coin.body.x = -100;
		coin.alive = false;
    },

    hitPipe: function(bird, pipe) {
        // If the bird has already hit a pipe, we have nothing to do
        if (world.bird.alive == false)
            return;
            
        // Set the alive property of the bird to false
        world.bird.alive = false;
		world.bird.body.acceleration.y = 0;

        // Prevent new pipes from appearing
        world.game.time.events.remove(world.timer);
    
        // Go through all the pipes, and stop their movement
        world.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, world);
    },

    restartGame: function() {
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        var pipe = world.pipes.getFirstDead();

        pipe.reset(x, y);
        pipe.body.velocity.x = -100;
		//pipe.body.width = 1;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < WORLD_HEIGHT / 60; i++)
            if (i == hole && i != hole +1) 
                world.addOnePipe(WORLD_WIDTH, i*60+10);    
    },
};

game.state.add('main', mainState);  
game.state.start('main'); 
