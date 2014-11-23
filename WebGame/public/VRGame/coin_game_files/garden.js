/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousGarden = root.Garden || {};

  var Superclass = THREE.Object3D;

  var Garden = root.Garden = function(size, amt) {

    Superclass.call(this);

    this.size = size;

    for (var i = 0; i < amt; i++) {

      var sculpture = new Sculpture();

      this.add(sculpture);

      sculpture.scale.x = this.size * (Math.random() - 0.5) + 1;
      sculpture.scale.y = this.size * Math.random() + 1;
      sculpture.scale.z = sculpture.scale.x;

      Garden.AssignRandomPointInField(this.size * this.size, sculpture.position, i, amt);

      sculpture.shadow.position.y = -(sculpture.position.y + 2.9) / sculpture.scale.y;

    }

  };

  Garden.AssignRandomPointInField = function(radius, v, index, length) {

    var x = (radius * Math.random() - radius / 2);
    var z = (radius * Math.random() - radius / 2);

    if (!v) {
      return new THREE.Vector3(x, 0, z);
    }

    v.set(x, 0, z);

    return v;

  };

  Garden.prototype = Object.create(Superclass.prototype);

  Garden.prototype.update = function(camera) {

    var v = camera.position;
    var limit = this.size * 10;
    var threshold = camera.far * camera.far;

    for (var i = 0, l = this.children.length; i < l; i++) {

      var s = this.children[i];

      var dx = v.x - s.position.x;
      var dz = v.z - s.position.z;

      var dist = dx * dx + dz * dz;
      s.material.opacity += (1 - s.material.opacity) * 0.0125;

      // Reset

      if (dist > threshold) {

        var theta = Math.random() * Math.PI * 2;
        var x = camera.far * Math.cos(theta);
        var z = camera.far * Math.sin(theta);

        s.position.copy(v);
        s.position.x += x;
        s.position.z += z;
        s.position.y = Math.random() * this.size * 2 - this.size / 2;

        s.scale.x = this.size * (Math.random() - 0.5) + 1;
        s.scale.y = this.size * Math.random() + 1;
        s.scale.z = s.scale.x;

        s.shadow.position.y = -(s.position.y + 2.9) / s.scale.y;
        s.material.opacity = 0;

      }

    }

    return this;

  };



})();