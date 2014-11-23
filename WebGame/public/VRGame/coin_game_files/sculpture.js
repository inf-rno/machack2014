/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousSculpture = root.Sculpture || {};

  var Superclass = THREE.Mesh;
  // var Superclass = THREE.Line;

  var vertices = [];
  var l = 50;
  // var l = 200;
  var phi = 6;

  var colors = [
    'rgb(233, 30, 99)',
    'rgb(85, 98, 180)',
    'rgb(237, 131, 108)',
    'rgb(245, 213, 98)',
    'rgb(238, 255, 65)'
  ];

  // Extruded Spline Path

  for (var i = 0; i < l; i++) {

    var pct = i / (l - 1);
    var theta = Math.PI * 2 * pct * phi;

    var taper = Math.sin(pct * Math.PI);

    var x = taper * Math.cos(theta);
    var y = (pct - 0.5) * 2;
    var z = taper * Math.sin(theta);

    vertices.push(new THREE.Vector3(x, y, z));

  }

  var geometry = new THREE.TubeGeometry(new THREE.SplineCurve3(vertices), 200, 0.02, 32, false);
  var material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true
  });

  // var geometry = new THREE.Geometry();
  // var material = new THREE.LineBasicMaterial({
  //   linewidth: 10
  // });
  // geometry.vertices = vertices;

  var Sculpture = root.Sculpture = function() {

    var m = material.clone();
    m.color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

    Superclass.call(this, geometry, m);

    this.shadow = new Shadow();
    this.add(this.shadow);

  };

  Sculpture.prototype = Object.create(Superclass.prototype);

})();