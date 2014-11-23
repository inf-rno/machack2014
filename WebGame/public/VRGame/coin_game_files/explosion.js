(function() {

  var root = this;
  var previousExplosion = root.Explosion || {};

  var Superclass = THREE.PointCloud;

  var material = new THREE.PointCloudMaterial({
    color: 0xfec10d,
    transparent: true,
    size: 0.2,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    map: THREE.ImageUtils.loadTexture('textures/circle.png')
  });

  var matrix = new THREE.Matrix4();

  var Explosion = root.Explosion = function(amt) {

    var geometry = new THREE.Geometry();

    for (var i = 0; i < amt; i++) {

      var theta = Math.random() * Math.PI * 2;
      var x = Math.cos(theta);
      var y = Math.sin(theta);

      matrix.identity()
        .makeRotationY(Math.random() * Math.PI * 2);

      geometry.vertices.push(new THREE.Vector3(x, y).applyMatrix4(matrix));

    }

    Superclass.call(this, geometry, material);

  };

  Explosion.prototype = Object.create(Superclass.prototype);

  Explosion.prototype._t = 0;
  Explosion.prototype._dest = 0;
  Explosion.prototype.scalar = 4;

  Explosion.prototype.explode = function() {

    this._t = 0.001;
    this._dest = 1;
    this.visible = true;

    this.rotation.set(Math.random(), Math.random(), Math.random());

    return this;

  };

  Explosion.prototype.update = function() {

    if (this._t < 0.001 || this._t > 0.999) {
      if (this.visible) {
        this.visible = false;
      }
      return this;
    }

    this._t += (this._dest - this._t) * 0.2;

    var s = this._t * this.scalar;

    this.scale.set(s, s, s);

    this.material.opacity = 1 - this._t;

    return this;

  };

})();