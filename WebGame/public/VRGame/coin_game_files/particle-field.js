/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousParticleField = root.ParticleField || {};

  var TEMP = new THREE.Vector3();
  var MAT = new THREE.Matrix4();

  var ParticleField = root.ParticleField = function(camera, size, amt, pSize, ct) {

    THREE.Object3D.call(this);

    var count = ct || 10;

    this.size = size || 100;
    this.amount = amt || 100;

    this.reference = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    var material = new THREE.PointCloudMaterial({
      size: pSize || 1,
      color: 0xffff00, //new THREE.Color(Math.random(), Math.random(), Math.random()),
      transparent: true,
      blending: THREE.AdditiveBlending,
      // sizeAttenuation: false,
      // depthTest: false,
      map: THREE.ImageUtils.loadTexture('textures/plus.png')
    });

    for (var i = 0; i < count; i++) {

      var geometry = new THREE.Geometry();

      for (var j = 0; j < this.amount; j++) {
        geometry.vertices[j] = ParticleField.AssignRandomPointInField(this.size);
      }

      var field = new THREE.PointCloud(geometry, material);

      field.index = i;
      ParticleField.AssignRandomPointInField(camera.far, field.position);

      field.geometry.computeBoundingSphere();

      this.add(field);

    }

  };

  ParticleField.AssignRandomPointOnSphere = function(radius, v) {

    var theta = Math.random() * Math.PI * 2;
    var x = radius * Math.cos(theta);
    var y = radius * Math.sin(theta);

    MAT.identity()
      .makeRotationY(Math.random() * Math.PI * 2);

    if (!v) {
      return new THREE.Vector3(x, y).applyMatrix4(MAT);
    }

    v.set(x, y, 0).applyMatrix4(MAT);

    return v;

  };

  ParticleField.AssignRandomPointInField = function(size, v) {

    var radius = Math.sqrt(Math.random()) * size;
    var theta = Math.random() * Math.PI * 2;
    var x = radius * Math.cos(theta);
    // var y = radius * Math.sin(theta);
    var y = Math.random() * (radius / 2 + 5) - 5;

    MAT.identity()
      .makeRotationY(Math.random() * Math.PI * 2);

    if (!v) {
      return new THREE.Vector3(x, y).applyMatrix4(MAT);
    }

    v.set(x, y, 0).applyMatrix4(MAT);

    return v;

  };

  ParticleField.prototype = Object.create(THREE.Object3D.prototype);

  /**
   * Update the positions of the all the fields based on the input camera.
   * Can be any Vector3 for the purpose of debugging.
   */
  ParticleField.prototype.update = function(camera) {

    var v = camera,
      threshold = this.size / 4;

    if (camera.position) {
      v = camera.position;
      if (camera.far) {
        threshold += camera.far;
      }
    }

    this.direction.copy(v).sub(this.reference).normalize();

    for (var i = 0, l = this.children.length; i < l; i++) {

      var field = this.children[i];
      // var dist = field.position.distanceTo(v);
      var dx = v.x - field.position.x;
      var dy = v.z - field.position.z;

      var dist = Math.sqrt(dx * dx + dy * dy);

      // var c = Math.min(Math.max(dist / (threshold), 0), 1);
      // field.material.opacity = 1 - c;

      if (dist > threshold) {
        field.position
          .copy(this.direction)
          .setLength(threshold)
          .add(v);
      }

    }

    this.reference.copy(v);
    return this;

  };

})();