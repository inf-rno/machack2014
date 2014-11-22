var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv');

var FLOW_TO_ACCEL_MULTIPLIER = 15;
var WORLD_WIDTH = 1024;
var WORLD_HEIGHT = 600;

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
        game.load.image('coin', 'assets/coin.png'); 
		game.load.image('trap', 'assets/trap.png'); 

        // Load the jump sound
        game.load.audio('jump', 'assets/jump.wav');
		game.load.audio('coin', 'assets/coin.wav');
		game.load.audio('boom', 'assets/boom.wav');  		
    },

    create: function() {
		world = this;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        world.coins = game.add.group();
        world.coins.enableBody = true;
        world.coins.createMultiple(20, 'coin');

		world.traps = game.add.group();
        world.traps.enableBody = true;
        world.traps.createMultiple(20, 'trap'); 		
        
		world.timer = world.game.time.events.loop(3500, world.addRowOfStuff, world);           
		
		
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
		world.coinSound = world.game.add.audio('coin');
		world.boomSound = world.game.add.audio('boom');
    },

	update: function() {
        //if (world.bird.inWorld == false)
        //    world.restartGame(); 
		
		if (world.bird.y < 0){world.bird.y = WORLD_HEIGHT-50;}
		if (world.bird.y > WORLD_HEIGHT - 50){world.bird.y = 0;}

        game.physics.arcade.overlap(world.bird, world.coins, world.hitCoin, null, world); 
		game.physics.arcade.overlap(world.bird, world.traps, world.hitTrap, null, world); 
		
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
		
		world.coinSound.play();
    },

    hitTrap: function(bird, trap) {
		world.boomSound.play();
		//todo decrease fuel

		trap.body.x = -100;
		trap.alive = false;
		return;
			
        // If the bird has already hit a coin, we have nothing to do
        if (world.bird.alive == false)
            return;
            
        // Set the alive property of the bird to false
        world.bird.alive = false;
		world.bird.body.acceleration.y = 0;

        // Prevent new coins from appearing
        world.game.time.events.remove(world.timer);
    
        // Go through all the coins, and stop their movement
        world.coins.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, world);
		
	   world.traps.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, world);
		

    },

    restartGame: function() {
        game.state.start('main');
    },

    addOnecoin: function(x, y) {
        var coin = world.coins.getFirstDead();

        coin.reset(x, y);
        coin.body.velocity.x = -100;
		//coin.body.width = 1;
        coin.checkWorldBounds = true;
        coin.outOfBoundsKill = true;
    },

    addRowOfCoins: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < WORLD_HEIGHT / 60; i++)
            if (i == hole && i != hole +1) 
                world.addOnecoin(WORLD_WIDTH, i*60+10);    
    },
	
	addOneTrap: function(x, y) {
        var trap = world.traps.getFirstDead();

        trap.reset(x, y);
        trap.body.velocity.x = -100;
		//trap.body.width = 1;
        trap.checkWorldBounds = true;
        trap.outOfBoundsKill = true;
    },

    addRowOfTraps: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < WORLD_HEIGHT / 60; i++)
            if (i == hole && i != hole +1) 
                world.addOneTrap(WORLD_WIDTH, i*60+10);    
    },
	
	addRowOfStuff: function() {
        var what = Math.floor(Math.random()*3)+1;
        
        switch (what)
		{
			case 1:
			case 2:
			world.addRowOfCoins();
			break;
			case 3:
			world.addRowOfTraps();
			break;
		}		
    },
};

game.state.add('main', mainState);  
game.state.start('main'); 
