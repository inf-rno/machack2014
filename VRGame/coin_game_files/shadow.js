/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousRoot = root.Shadow || {};

  var Superclass = THREE.Mesh;

  var Shadow = root.Shadow = function() {

    Superclass.call(this, Shadow.Geometry, Shadow.Material);

    this.rotation.x = Math.PI / 2;

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

  Shadow.Geometry = new THREE.ShapeGeometry(shape);
  Shadow.Material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.05,
    depthWrite: false
  });

  Shadow.prototype = Object.create(Superclass.prototype);

})();