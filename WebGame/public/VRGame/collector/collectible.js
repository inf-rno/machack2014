/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousCollectible = root.Collectible || {};
  var instances = [];

  var fakeSound = {
    _ready: false,
    play: function() {
      return fakeSound;
    },
    stop: function() {
      return fakeSound;
    }
  };

  var sounds = {
    coin: fakeSound,
    game: fakeSound,
    scoreboard: fakeSound,
    wind: fakeSound
  };

  var Coin = function(scale, radius) {

    THREE.Object3D.call(this);

    this.radius = radius || 1;

    var mesh = this.mesh = new THREE.Mesh(Coin.Geometry, Coin.Material);
    mesh.scale.set(scale || 1, scale || 1, scale || 1);

    var shadow = this.shadow = new Shadow();
    shadow.scale.set(scale || 1, (scale || 1) / 2, scale || 1);
    shadow.position.y = -2.9;

    this.add(mesh);
    this.add(shadow);

  };

  // Coin.prototype = THREE.Mesh.prototype;
  Coin.prototype = Object.create(THREE.Object3D.prototype);

  /**
   * Collect a coin with corresponding animation and reposition.
   */
  Coin.prototype.collect = function(callback) {

    // TODO: Add some kind of animation
    sounds.coin.play();
    return this.reset();

  };

  /**
   * Reset the position and state of the coin.
   */
  Coin.prototype.reset = function() {

    this.visible = false;
    this.mesh.visible = false;
    this.shadow.visible = false;

    // var theta = Math.random() * Math.PI * 2;
    // var x = this.radius * Math.cos(theta);
    // var z = this.radius * Math.sin(theta);

    // Coin.Vector.set(
    //   x,
    //   0,
    //   z
    // );
    // this.position.add(Coin.Vector);

    return this;

  };

  var width = 1;
  var height = 1;
  var resolution = 32;

  var points = _.map(_.range(resolution), function(i) {
    var pct = i / (resolution - 1);
    var theta = pct * Math.PI * 2;
    return new THREE.Vector2(width * Math.cos(theta), height * Math.sin(theta));
  });
  var shape = new THREE.Shape(points);

  Coin.Shape = shape;
  Coin.Geometry = new THREE.ShapeGeometry(shape);
  Coin.Material = new THREE.MeshLambertMaterial({
    color: 0xfec10d,
    // transparent: true,
    side: THREE.DoubleSide,
    emissive: 0x333333,
    // map: THREE.ImageUtils.loadTexture('textures/glisten.png'),
  });
  Coin.Vector = new THREE.Vector3();

  var Collectible = root.Collectible = function(radius, size, binSize, rows, cols) {

    THREE.Object3D.call(this);

    this.size = size;
    this.radius = radius;
    this.bin = binSize;

    this.rows = {
      min: Infinity,
      max: -Infinity,
      value: rows
    };

    this.cols = {
      min: Infinity,
      max: -Infinity,
      value: rows
    };

    this.items = {};
    this.callbacks = [];

    this.origin = new THREE.Vector3();

    for (var i = 0; i < rows * cols; i++) {
      this.add(new Coin(radius, size));
    }

    this.restart();
    instances.push(this);

  };

  Collectible.Coin = Coin;

  Collectible.prototype = Object.create(THREE.Object3D.prototype);

  Collectible.prototype.collected = 0;

  Collectible.prototype._ready = false;

  Collectible.prototype._onCollect = function() {};

  Collectible.prototype.setExplosion = function(e) {
    this.explosion = e;
    return this;
  };

  Collectible.prototype.ready = function(f) {
    if (this._ready) {
      f();
      return this;
    }
    this.callbacks.push(f);
  };

  Collectible.prototype.load = function() {
    _.each(this.callbacks, function(c) {
      c();
    });
    this._ready = true;
    return this;
  };

  Collectible.prototype.update = function(camera) {

    var v = camera.position;
    var threshold = this.radius;

    var x = Math.max(Math.min(Math.round(v.x / this.bin) * this.bin, this.rows.max), this.rows.min);
    var z = Math.max(Math.min(Math.round(v.z / this.bin) * this.bin, this.cols.max), this.cols.min);

    var coin = this.items[x], dist;

    if (coin) {

      coin = coin[z];

      if (coin && coin.visible) {

        dist = v.distanceTo(coin.position);

        if (dist < threshold) {
          this.collect(coin);
        }

      }

    }

    for (var i = 0, l = this.children.length; i < l; i++) {

      var c = this.children[i];

      if (!c.visible) {
        continue;
      }

      c.rotation.y += Math.PI / 32;

    }

    if (this.position.y < -0.0001) {
      this.position.y -= this.position.y * 0.125;
    } else if (this.position.y !== 0) {
      this.position.y = 0;
    }

    var dx = v.x - this.origin.x;
    var dz = v.z - this.origin.z;

    dist = dx * dx + dz * dz;
    threshold = (camera.far * 1.33) * (camera.far * 1.33);

    if (dist > threshold) {
      this.restart(v, true);
    }

    return this;

  };

  /**
   * Increment counters for when user has collected a specific coin.
   */
  Collectible.prototype.collect = function(coin) {

    var now = Date.now();

    if (this.explosion && this.explosion.explode) {
      this.explosion.position.copy(coin.position);
      this.explosion.explode();
    }

    coin.collect();
    var v = Math.floor(Math.random() * 1000000 / (now - this.lastTime));
    this.collected += Math.max(v, 10);

    this._onCollect(coin);

    this.lastTime = now;

    if ('vibrate' in navigator) {
      navigator.vibrate(0);
      navigator.vibrate([150]);
    }

    return this;

  };

  /**
   * Reset all coins. Should only need to be used on initialization.
   */
  Collectible.prototype.reset = function() {

    this.lastTime = Date.now();
    this.position.y = -5;

    return this;

  };

  Collectible.prototype.restart = function(origin, keepScore) {

    var radius = this.radius;
    var size = this.size;

    var rows = this.rows.value;
    var cols = this.cols.value;

    var n = 0;

    if (!keepScore) {
      this.collected = 0;
    }

    for (var i = 0; i < rows; i++) {

      var x = this.bin * i - (this.bin * (rows)) / 2;

      if (origin) {
        x += Math.round(origin.x / this.bin) * this.bin;
      }

      var coins = {};

      this.rows.min = Math.min(x, this.rows.min);
      this.rows.max = Math.max(x, this.rows.max);

      for (var j = 0; j < cols; j++) {

        var z = this.bin * j - (this.bin * (cols)) / 2;

        if (origin) {
          z += Math.round(origin.z / this.bin) * this.bin;
        }

        this.cols.min = Math.min(z, this.cols.min);
        this.cols.max = Math.max(z, this.cols.max);

        if (x === 0 && z === 0) {
          continue;
        }

        var coin = this.children[n];

        coin.visible = true;
        coin.mesh.visible = true;
        coin.shadow.visible = true;

        coin.position.x = x;
        coin.position.z = z;

        coins[z] = coin;

        n++;

      }

      this.items[x] = coins;

    }

    this.width = this.rows.max - this.rows.min;
    this.height = this.cols.max - this.cols.min;

    if (origin) {
      this.origin.copy(origin);
    }

    return this.reset();

  };

  var ready = _.after(1, function() {
    _.each(instances, function(i) {
      i.load();
    });
  });

  Sound.ready(function() {

    sounds.coin = new Sound('./audio/coin.mp3');
    sounds.scoreboard = new Sound('./audio/scoreboard.mp3');
    sounds.game = new Sound('./audio/gameplay.mp3', ready);
    sounds.wind = new Sound('./audio/wind.mp3', function() {
      sounds.wind.play({
        loop: true
      });
      // ready();
    });

  });

  Collectible.Sounds = sounds;

})();