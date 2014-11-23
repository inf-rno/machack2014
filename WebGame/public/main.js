var FLOW_TO_ACCEL_MULTIPLIER = 15;
var WORLD_WIDTH = 1024;
var WORLD_HEIGHT = 800;

var game = new Phaser.Game(WORLD_WIDTH, WORLD_HEIGHT, Phaser.AUTO, 'gameDiv');

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

        game.load.image('ship', 'assets/ship_with_flame_horizontal.png');
        game.load.image('ship_idle', 'assets/ship_horizontal.png');
        game.load.image('coin', 'assets/coin.png'); 
		game.load.image('trap', 'assets/trap.png'); 
		
		game.load.image('jewel1', 'assets/jewel1.png');
		game.load.image('jewel2', 'assets/jewel2.png');
		game.load.image('jewel3', 'assets/jewel3.png');
		game.load.image('jewel4', 'assets/jewel4.png');
		game.load.image('jewel5', 'assets/jewel5.png');
		
		game.load.image('trap1', 'assets/trap1.png');
		game.load.image('trap2', 'assets/trap2.png');
		game.load.image('trap3', 'assets/trap3.png');
		game.load.image('trap4', 'assets/trap4.png');
		game.load.image('trap5', 'assets/trap5.png');
		
		game.load.image('background', 'assets/milkyway_seamless.jpg');
		game.load.image('background2', 'assets/space_cloud.png');
		game.load.image('background3', 'assets/space_cloud_small.png');

        // Load the jump sound
        game.load.audio('jump', 'assets/jump.wav');
		game.load.audio('coin', 'assets/coin.wav');
		game.load.audio('boom', 'assets/boom.wav');  		
    },

    create: function() {
		world = this;
        world.gamePulses = 0;
	world.maxIntensity = 0;
	game.physics.startSystem(Phaser.Physics.ARCADE);
		
		world.background = game.add.tileSprite(0,0,WORLD_WIDTH,WORLD_HEIGHT,'background');
		world.background.autoScroll(-10,0);
		
		world.background2 = game.add.tileSprite(0,0,WORLD_WIDTH,WORLD_HEIGHT,'background2');
		world.background2.autoScroll(-30,0);
		
		world.background3 = game.add.tileSprite(0,0,WORLD_WIDTH,WORLD_HEIGHT,'background3');
		world.background3.autoScroll(-20,0);

		world.coins = game.add.group();
        world.coins.enableBody = true;
		for(var i=1;i<=5;i++)
		{
			var coin = world.coins.create(0,0,'jewel'+i,null,false); 		
			world.coins.add(coin);
			coin.anchor.setTo(0.5,0.5);
		}
		
        world.traps = game.add.group();
        world.traps.enableBody = true;
		for (var i=1;i<=5;i++)
		{
			var trap = world.traps.create(0,0, 'trap'+i,null,false);
			trap.width *= 1.5;
			trap.height *= 1.5;
			world.traps.add(trap);
			trap.anchor.setTo(0.5,0.5);
		}
		
		
        world.ship = world.game.add.sprite(100, 245, 'ship_idle');
        game.physics.arcade.enable(world.ship);
        world.ship.body.gravity.y = 0; 
		world.ship.body.width = 100;
		world.ship.body.height = 40;
		world.ship.body.offset.x = 10;

        // New anchor position
        world.ship.anchor.setTo(0.5, 0.5);
		world.ship.alive = false; // Game not running yet
		world.ship.loadTexture('ship_idle', 0);
 
        var spaceKey = world.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(world.jump, world); 

        world.score = 0;
        world.labelScore = world.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });
	
		world.fueling = true;
		world.fuelingTimeLeft = 10;
		world.gameOverLabel = world.game.add.text(200, 270, "0", { font: "36px Avenir Heavy", fill: "#ffffff" }); // Avenir Heavy
		world.gameOverLabel.text = "";
		world.labelBlow = world.game.add.text(380, 270, "0", { font: "36px Avenir Heavy", fill: "#ffffff" }); // Avenir Heavy
		world.labelBlow.text = "Blow to fuel up!"
		
		world.labelBlowTimer = world.game.add.text(470, 320, "0", { font: "36px Avenir Heavy", fill: "#ffffff" }); // Avenir Heavy
		world.labelBlowTimer.text = world.fuelingTimeLeft

		world.fuel = 0; // Increment to fuel up
        world.labelFuel = world.game.add.text(20, 80, "0", { font: "30px Arial", fill: "#ffffff" });  

		
        // Add the jump sound
        world.jumpSound = world.game.add.audio('jump');
		world.coinSound = world.game.add.audio('coin');
		world.boomSound = world.game.add.audio('boom');
    },

    update: function() {
		world.labelFuel.text = world.fuel;

	if(!world.ship.alive) {
		// Game not started
		return;
	}
        if (world.fuel <= 0) {
		world.gameOver = true;
		world.ship.alive = false;
		world.ship.loadTexture('ship_idle', 0);
		world.gameOverTimer = 10;
		world.gameOverLabel.text = "Game Over! " + Math.round(world.gamePulses/7.5/60.0*100)/100 + " liters, max intensity " + world.maxIntensity;
		world.ship.body.gravity.y = 0;
		world.ship.body.acceleration.y = 0;
		world.ship.loadTexture('ship_idle', 0);
		world.ship.body.velocity.y = 0;
		world.game.time.events.remove(world.timer);
	}
		
		if (world.ship.y < world.ship.height/2)
		{
			world.ship.y = world.ship.height/2;
			world.ship.body.velocity.y = 0;
		}
		if (world.ship.y > (WORLD_HEIGHT -  50)- (world.ship.height*0.5))
		{
			world.ship.y = (WORLD_HEIGHT -  50)- (world.ship.height*0.5);
			world.ship.body.velocity.y = 0;
		}

        game.physics.arcade.overlap(world.ship, world.coins, world.hitCoin, null, world); 
	game.physics.arcade.overlap(world.ship, world.traps, world.hitTrap, null, world);
		
        // Slowly rotate the ship downward, up to a certain point.
		var dy = world.ship.body.velocity.y;
		var dy = capVelocity(dy);
		world.ship.body.velocity.y = dy;
		
		var dy = dy / 400;
		
		var targetAngle = Math.round(dy * 75);
		var da = world.ship.angle - targetAngle;
       if (da != 0)
	   {
		  if (Math.abs(da) > 4)
		  {
	       if (da>0)
		   {world.ship.angle-=4;}
		   else
		   {world.ship.angle+=4;}
		   }
		   else
		   {
		   if (da>0)
		   {world.ship.angle-=1;}
		   else
		   {world.ship.angle+=1;}
		   
		   }
		}		   
    },
	render:function(){
		//game.debug.body(world.ship);
	},

    jump: function() {
        // If the ship is dead, he can't jump
        if (world.ship.alive == false)
            return; 

        world.ship.body.velocity.y = -350;

        // Jump animation
        game.add.tween(world.ship).to({angle: -20}, 100).start();

        // Play sound
        world.jumpSound.play();
    },
    flap:function(howMuch, pulses)
	{
		if (howMuch != 0  && world.ship.alive)
		{
			world.gamePulses += pulses;
			if(world.maxIntensity < howMuch) {
				world.maxIntensity = howMuch;
			}
			var currentAcceleration = capAcceleration(world.ship.body.acceleration.y);
			var newAcceleration = capAcceleration(0 - (howMuch*FLOW_TO_ACCEL_MULTIPLIER));
			world.ship.body.acceleration.y = newAcceleration;
			
			if(world.ship.body.acceleration.y < 0) {
			    world.ship.loadTexture('ship', 0);	
			} else {
			    world.ship.loadTexture('ship_idle', 0);
			}
		} else if (world.ship.alive) {
			world.ship.body.acceleration.y = 0;
			world.ship.loadTexture('ship_idle', 0);
		} else if (world.fueling && howMuch > 0) {
			// Increment fuel
			world.fuel += Math.floor(howMuch/15);
			console.log(howMuch)
		}
	},

    hitCoin: function(ship, coin) {
	    world.score += 1;
        world.labelScore.text = world.score; 
		
		coin.body.x = -100;
		coin.alive = false;
		
		world.coinSound.play();
    },

    hitTrap: function(ship, trap) {
		world.boomSound.play();
		//todo decrease fuel

		trap.body.x = -100;
		trap.alive = false;
		
		world.fuel -= 5;
		if(world.fuel < 0) {
			world.fuel = 0;
		}
		return;
			
        // If the ship has already hit a coin, we have nothing to do
        if (world.ship.alive == false)
            return;
            
        // Set the alive property of the ship to false
        world.ship.alive = false;
		world.ship.body.acceleration.y = 0;

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
	if(coin) {
		coin.reset(x, y);
		coin.body.velocity.x = -100;
		coin.body.angularVelocity = -50;
			//coin.body.width = 1;
		coin.checkWorldBounds = true;
		coin.outOfBoundsKill = true;	
	}
    },

    addRowOfCoins: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < WORLD_HEIGHT / 60; i++)
            if (i == hole && i != hole +1) 
                world.addOnecoin(WORLD_WIDTH, i*60+10);    
    },
	
    addOneTrap: function(x, y) {
        var trap = world.traps.getFirstDead();
	if(trap) {
		trap.reset(x, y);
		trap.body.velocity.x = -100;
		trap.body.angularVelocity = 50;
			//trap.body.width = 1;
		trap.checkWorldBounds = true;
		trap.outOfBoundsKill = true;	
	}
    },

    addRowOfTraps: function() {
        var hole = Math.floor(Math.random()*WORLD_HEIGHT / 60)+1;
        
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


setInterval(function(){
    if (world)
    {
	if(world.gameOver) {
		world.gameOverTimer--;
		world.labelBlowTimer.text = world.gameOverTimer;
		if(world.gameOverTimer <= 0) {
			world.gameOver = false;
			world.gameOverLabel.text = "";
			world.restartGame();
		}
		
	} else if(world.fueling) {
		world.fuelingTimeLeft--;
		world.labelBlowTimer.text = world.fuelingTimeLeft
		
		if(world.fuelingTimeLeft <= 0) {
			// Start the game
			world.fueling = false;
			
			world.coins.createMultiple(20, 'coin');
			world.traps.createMultiple(20, 'trap');
			world.timer = world.game.time.events.loop(3500, world.addRowOfStuff, world);
			world.ship.body.gravity.y = 500;
			world.ship.alive = true;
			world.ship.loadTexture('ship_idle', 0);
			
			world.labelBlow.text = "";
			world.labelBlowTimer.text = "";
		}
	} else if(world.fuel > 0) {
		world.fuel = Math.max(0, world.fuel -1);	
	}
    }
},1000);

game.state.add('main', mainState);  
game.state.start('main'); 
