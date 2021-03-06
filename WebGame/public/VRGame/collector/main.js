/**
 * @jonobr1 / http://jonobr1.com
 */

// Cardboard

function Cardboard() {

  this.renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  this.renderer.setSize(window.innerWidth, window.innerHeight);

  this.scene = new THREE.Scene();
  this.effect = new THREE.StereoEffect(this.renderer);

  this.camera = new THREE.PerspectiveCamera(
  90, window.innerWidth / window.innerHeight, 0.001, 1700
  );
  this.scene.add(this.camera);

  this.controls = new THREE.DeviceOrientationControls(this.camera, true);
  this.controls.connect();

  window.addEventListener('resize', this.resize.bind(this), false);
  setTimeout(this.resize.bind(this), 0);

  // hack for resize when iframe doesn't get a rotation event
  // window.addEventListener('message', this.resize.bind(this), false );

  this.renderer.domElement.addEventListener('click', function() {
    if (!this.debug) {
      this.fullscreen();
    }
  }.bind(this), false);

  this.animate = this.animate.bind(this);
  setTimeout(this.play.bind(this), 0);

}

Cardboard.prototype.animate = function() {
  if (!this._playing)
    return;
  requestAnimationFrame(this.animate);
  this.update();
  this.render();
};

Cardboard.prototype.pause = function() {
  this._playing = false;
};

Cardboard.prototype.play = function() {
  if (this._playing) return;
  this._playing = true;
  this.animate();
};

Cardboard.prototype.update = function() {
  // hack to resize if width and height change
  if (this.width !== window.innerWidth || this.height !== window.innerHeight) {
    this.resize();
  }
  this.camera.updateProjectionMatrix();
  this.controls.update();
};

Cardboard.prototype.render = function() {
  if (this.debug) {
    this.renderer.render(this.scene, this.camera);
  } else {
    this.effect.render(this.scene, this.camera);
  }
};

Cardboard.prototype.fullscreen = function() {
  if (this.renderer.domElement.requestFullscreen) {
    this.renderer.domElement.requestFullscreen();
  } else if (this.renderer.domElement.msRequestFullscreen) {
    this.renderer.domElement.msRequestFullscreen();
  } else if (this.renderer.domElement.mozRequestFullScreen) {
    this.renderer.domElement.mozRequestFullScreen();
  } else if (this.renderer.domElement.webkitRequestFullscreen) {
    this.renderer.domElement.webkitRequestFullscreen();
  }
};

Cardboard.prototype.resize = function() {
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.camera.aspect = this.width / this.height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.width, this.height);
  this.effect.setSize(this.width, this.height);
};

(function() {

  var root = this;
  var previousCollector = root.Collector || {};

  var temp = new THREE.Vector3();
  var clock = new THREE.Clock(true);
  
  function loadTexture(path) {
    if (typeof passthrough_vars !== 'undefined' && passthrough_vars.offline_mode) {
      // same origin policy workaround
      var b64_data = $('img[data-src="' + path + '"]').attr('src');

      var new_image = document.createElement( 'img' );
      var texture = new THREE.Texture( new_image );
      new_image.onload = function()  {
        texture.needsUpdate = true;
      };
      new_image.src = b64_data;
      return texture;
    }
    return THREE.ImageUtils.loadTexture(path);
  }

  var Collector = root.Collector = function() {

    Cardboard.call(this);

    var scope = this;
    var fov = window.innerWidth / window.innerHeight;

    this.cameras = {
      isFirstPerson: true,
      wide: this.camera,
      firstPerson: new THREE.PerspectiveCamera(90, fov, 1, 50)
    };

    this.cameras.firstPerson.light = new THREE.PointLight(0xffffff, 1, 0);
    this.cameras.firstPerson.shadow = new Shadow();

    this.controls.disconnect();

    if (has.mobile) {
      this.controls = new THREE.DeviceOrientationControls(this.cameras.firstPerson);
    } else {
      this.controls = new THREE.FirstPersonControls(this.cameras.firstPerson);
    }

    this.controls.connect();

    this.controls.movementSpeed = 10;
    this.controls.rollSpeed = Math.PI / 4;
    this.controls.autoForward = true;

    this.scene.fog = new THREE.Fog(0x000000, 10, 45);

    this.garden = new Garden(25, 8);

    this.particles = new ParticleField(this.cameras.firstPerson, 50, 20, 0.5, 4);

    this.collectible = new Collectible(0.66, this.cameras.firstPerson.far, 10, 200, 1);
    this.ui = new UI(this.collectible, 0, this);
    this.explosion = new Explosion(100);
    this.collectible.explosion = this.explosion;
	
	this.cockpit = new Cockpit(25, this.scene);

    this.ui.position.z = -6;
    this.explosion.position.z = -6;


    this.cameras.firstPerson.shadow.position.y = -2.9;
    this.cameras.firstPerson.shadow.scale.set(5, 5, 5);
	
	var geometry = new THREE.SphereGeometry(30, 60, 40);
	var uniforms = {
	  texture: { type: 't', value: loadTexture('./../assets/milkyway_seamless.jpg') }
	};

	var material = new THREE.ShaderMaterial( {
	  uniforms:       uniforms,
	  vertexShader:   document.getElementById('sky-vertex').textContent,
	  fragmentShader: document.getElementById('sky-fragment').textContent
	});

	this.skyBox = new THREE.Mesh(geometry, material);
	this.skyBox.scale.set(-1, 1, 1);
	this.skyBox.eulerOrder = 'XZY';
	this.skyBox.renderDepth = 1.0;
	this.scene.add(this.skyBox);

    this.scene.add(this.collectible);
    this.scene.add(this.particles);
    this.scene.add(this.cameras.firstPerson);
    this.scene.add(this.explosion);

    this.cameras.firstPerson.add(this.ui);
    this.cameras.firstPerson.add(this.cameras.firstPerson.light);

    this.cameras.wide.position.y = 20;

    this.renderman = {
      // current: has.mobile ? this.effect : this.renderer,
      current: this.effect,
      // current: this.renderer,
      flat: this.renderer,
      stereo: this.effect
    };

    this._velocity = 0;
    this.vector = new THREE.Vector3();

    window.addEventListener('keyup', function(e) {

      switch (e.which) {
        case 32: // Spacebar
          scope.jump();
          break;

        case 82: // R
            if (scope.ui.over) {
                scope.restart();
            }
          break;
      }

    }, false);

    setTimeout(function() {

      scope.__ready = true;

    }, 1000);

    this.effect.separation = 0;
    this.renderer.setClearColor(0x000000, 1);

    if (!has.mobile) {
      // this.renderer.autoClear = true;
      this.fullscreen = function() {};
    }
	
	window.flowListener = scope.fly.bind(scope);

  };

  Collector.prototype = Object.create(Cardboard.prototype);
  Collector.prototype.constructor = Collector;

  // Collector.prototype.fullscreen = function() {};

  Collector.prototype.restarting = false;

  Collector.prototype.jump = function() {

    if (this._jumping) {
      return;
    }

    this._velocity = 0.4;
    this._jumping = true;

    return this;

  };
  
  Collector.prototype.fly = function(msg) {
    if(!msg || !msg.value || msg.value <= 0) {
      return;
    }

    //todo: Now what?
    console.log(msg.value);
	if(this.ui.fueling) {
	  this.ui.duration += Math.floor(msg.value*1000/20);
	} else if (!this.ui.over)
	{
		this._velocity += msg.value / 800;
		this._jumping = true;
    }
	return this;

  };

  Collector.prototype.resize = function() {

    Cardboard.prototype.resize.call(this);

    var camera = this.camera;

    if (this.cameras.isFirstPerson) {
      camera = this.cameras.firstPerson;
    }

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

  };

  Collector.prototype.update = function() {

    var fp = this.cameras.firstPerson;
    var fpv = fp.position;
	
    if (this.ui.over || this.ui.fueling || this.restarting) {
      this.controls.movementSpeed = 0;
    } else {
      this.controls.movementSpeed = 10;
    }

    this.controls.update(clock.getDelta());

    this._velocity = Math.min(this._velocity, 1);

    fpv.y += this._velocity;
    fpv.y = Math.max(fpv.y, 0);

    fpv.y = Math.min(fpv.y, this.collectible.maxHeight);

    if (fpv.y <= 0) {
      fpv.y = 0;
      this._velocity = 0;
      this._jumping = false;
      if (this.restarting) {
        this.ui.start();
        this.restarting = false;
      }
    } else {
      this._velocity -= 0.01;
    }

    var s = Math.max(Math.min(1 - fpv.y / 50, 1), 0);
    fp.shadow.scale.set(s, s, s);
    if (Collectible.Sounds.game._ready) {
      Collectible.Sounds.game.gain.gain.value = s;
    }
    //if (Collectible.Sounds.scoreboard._ready) {
    //  Collectible.Sounds.scoreboard.gain.gain.value = s;
    //}
    if (Collectible.Sounds.coin._ready) {
      Collectible.Sounds.coin.gain.gain.value = s;
    }
    if (Collectible.Sounds.wind._ready) {
      Collectible.Sounds.wind.gain.gain.value = 1 - Math.sqrt(s);
    }

    this.camera.lookAt(fpv);

    this.camera.position.x = fp.shadow.position.x = fpv.x;
    this.camera.position.z = fp.shadow.position.z = fpv.z;

    this.vector.set(0, 0, -1).applyQuaternion(fp.quaternion);

    this.collectible.update(fp);

    this.ui.update(fp);
    this.particles.update(fp);

    this.garden.update(fp);
    this.explosion.update();

	
	this.skyBox.position.x = fpv.x;
	this.skyBox.position.y = fpv.y;
	this.skyBox.position.z = fpv.z;
	
	this.cockpit.update(fp);
  };

  Collector.prototype.render = function() {

    var camera = this.cameras.wide;

    if (this.cameras.isFirstPerson) {
      camera = this.cameras.firstPerson;
    }

    this.renderman.current.render(this.scene, camera);

  };

  Collector.prototype.restart = function() {

    this.ui.restart();
    this.collectible.restart(this.cameras.firstPerson.position);

    this.restarting = true;

    return this;

  };

})();