/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousCockpit = root.Cockpit || {};

  var Superclass = THREE.Object3D;
  
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

  var Cockpit = root.Cockpit = function(size, scene) {

    Superclass.call(this);

    this.size = size;

	var geometry = new THREE.SphereGeometry(2, 120, 120);
	var uniforms = {
	  texture: { type: 't', value: loadTexture('./images/cockpit.png') }
	};

	var material = new THREE.ShaderMaterial( {
	  uniforms:       uniforms,
	  vertexShader:   document.getElementById('sky-vertex').textContent,
	  fragmentShader: document.getElementById('sky-fragment').textContent,
	  transparent:true
	});
	
	this.Hud = new THREE.Mesh(geometry, material);
	this.Hud.scale.set(-1, 1, 1);
	this.Hud.eulerOrder = 'XZY';
	this.Hud.renderDepth = 1.0;
	this.Hud.rotateY(-165/180*Math.PI);
	this.Hud.rotateZ(30/180*Math.PI);
	this.add(this.Hud);
	scene.add(this.Hud);
	console.log("trying to add cockpit");
    //init

  };

  Cockpit.prototype = Object.create(Superclass.prototype);

  Cockpit.prototype.update = function(camera) {
  
	var fpv = camera.position;

    var v = camera.position;
	this.Hud.position.x = fpv.x;
	this.Hud.position.y = fpv.y;
	this.Hud.position.z = fpv.z;
	
	//this.Hud.quaternion.copy( camera.quaternion );
	//console.log("trying to update cockpit");
    

    return this;

  };



})();