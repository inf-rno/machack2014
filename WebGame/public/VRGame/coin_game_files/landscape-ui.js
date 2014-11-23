/**
 * @jonobr1 / http://jonobr1.com
 */
(function() {

  var root = this;
  var previousUI = root.UI || {};

  var color = 'white';
  var delta = new THREE.Vector3();

  var two = new Two({
    type: Two.Types.canvas,
    width: 128,
    height: 128,
    ratio: 4
  });

  var canvas = two.renderer.domElement;
  var ctx = canvas.getContext('2d');

  var loader = new SpritePlayer(_.map(_.range(50), function(i) {
    var num = (i + 1).toString();
    var pre = '';
    var l = num.length;
    while (l < 4) {
      pre += '0';
      l++
    }
    return 'images/loader/loader_animation_' + pre + num + '.png';
  }), canvas);
  loader.fps = 30;
  loader.render = function() {
    if (this._imgs.length <= 0) {
      return this;
    }
    this._ctx.drawImage(this._imgs[this._index], -64, -64);
    return this;
  };

  var fontSize = 48;
  var lineHeight = fontSize * (30 / 24);

  ctx.font = '800 ' + fontSize + 'px Sniglet, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  canvas.style.zIndex = 9999;
  canvas.style.position = 'absolute';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.border = '3px solid #ccc';

  // var cursor = (function() {
  var timer = (function() {

    var factor = 6;

    var width = two.width - (two.width / factor) * 2;

    var backline = two.makeLine(two.width / factor, two.height - two.height / factor, two.width - two.width / factor, two.height - two.height / factor);
    backline.noFill().stroke = color;
    backline.linewidth = 6;
    backline.cap = 'round';

    var baseline = two.makeLine(two.width / factor, two.height - two.height / factor, two.width - two.width / factor, two.height - two.height / factor);
    baseline.noFill().stroke = 'rgb(85, 98, 180)';
    baseline.linewidth = 2;
    baseline.cap = 'round';

    var a = two.makePolygon(1, 6, 1, 1, 6, 1, true);
    a.linewidth = 2;
    a.cap = 'round';
    a.join = 'round';
    a.noFill().stroke = color;

    var b = a.clone();
    b.rotation = Math.PI / 2;
    b.translation.set(two.width - 4, 4);
    b.linewidth = 2;
    b.cap = 'round';
    b.join = 'round';
    b.noFill().stroke = color;

    var c = a.clone();
    c.rotation = Math.PI;
    c.translation.set(two.width - 4, two.height - 4);
    c.linewidth = 2;
    c.cap = 'round';
    c.join = 'round';
    c.noFill().stroke = color;

    var d = a.clone();
    d.rotation = Math.PI * 1.5;
    d.translation.set(4, two.height - 4);
    d.linewidth = 2;
    d.cap = 'round';
    d.join = 'round';
    d.noFill().stroke = color;

    return {

      baseline: baseline,

      set: function(pct) {

        var clamp = Math.min(Math.max(pct, 0.01), 1);
        if (_.isNaN(clamp)) {
          return;
        }
        var v = clamp * width - width / 2;
        baseline.vertices[1].x += (v - baseline.vertices[1].x) * 0.125;

        if (clamp <= 0.2093023255813954) {
          baseline.stroke = lerpColor((Math.sin(Date.now() / 100) + 1) / 2);
        } else {
          baseline.stroke = 'rgb(85, 98, 180)';
        }

      }

    };

  })();

  if (has.localStorage && !window.localStorage['collector-score']) {
    window.localStorage['collector-score'] = '[]';
  }

  var UI = root.UI = function(collectible, duration) {

    THREE.Mesh.call(this, UI.Geometry, UI.Material);

    var scope = this;

    this.collectible = collectible;
    this.collectible._onCollect = function(coin) {
      scope.onCollect(coin);
    };

    this.duration = (duration || 42) * 1000;

    this.collectible.ready(function() {
      scope.start();
    });

  };

  UI.Geometry = new THREE.PlaneGeometry(7, 7);
  UI.Material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
    opacity: 0.9,
    map: new THREE.Texture(two.renderer.domElement)
  });

  UI.prototype = Object.create(THREE.Mesh.prototype);

  UI.prototype._scaleDest = 1;
  UI.prototype._scale = 1;
  UI.prototype._endScale = 0;
  UI.prototype._endScaleDest = 0;

  UI.prototype.over = true;
  UI.prototype._init = true;

  UI.prototype.start = function() {

    this.startTime = Date.now();
    Collectible.Sounds.game.play();
    Collectible.Sounds.scoreboard.stop();
    this.over = false;
    this._init = false;
    return this;

  };

  UI.prototype.restart = function() {

    this._scale = 0;
    this._endScale = 1;
    this._scaleDest = 1;
    this._endScaleDest = 0;

    return this;

  };

  UI.prototype.end = function() {

    this._endScaleDest = 1;
    this.over = true;
    Collectible.Sounds.game.stop();
    Collectible.Sounds.scoreboard.play({
      loop: true
    });

    if (!has.localStorage) {
      return this;
    }

    var scores = this.scores = JSON.parse(window.localStorage['collector-score']) || [];
    var score = this.collectible.collected;
    var index = 0;
    var added = false;

    // Make sure the array doesn't take up too much memory...
    scores.length = Math.min(scores.length, 20);

    // Sort and cull
    for (var i = 0; i < scores.length; i++) {

      if (score > scores[i]) {
        scores.splice(i, 0, score);
        index = i;
        added = true;
        break;
      }

    }

    if (!added) {
      index = scores.length;
      scores.push(score);
    }

    this._scaleDest = 0;
    this.index = index;

    window.localStorage['collector-score'] = JSON.stringify(scores);

    return this;

  };

  UI.prototype.update = function() {

    // if (this.over && this._endScale >= 0.99999) {
    //   return this;
    // }

    var now = Date.now();
    var pct = (now - this.startTime) / this.duration;

    if (pct > 1 && !this.over) {
      this.end();
    }

    timer.set(1 - pct);

    // Update Two.js elements
    two.update();

    ctx.fillStyle = color;

    if (this._init) {

      var scale = 0.0625 * (Math.sin(now / 100) + 1) / 2 + 1;

      ctx.save();
      ctx.translate(two.renderer.ratio * two.width / 2, two.renderer.ratio * two.height / 2);
      loader.update().render();
      // ctx.drawImage(loader, - (loader.videoWidth || 0) / 2, - (loader.videoHeight || 0) / 2);
      ctx.restore();

    }

    // Add game over screen
    if (this.over && !this._init) {

      this._endScale += (this._endScaleDest - this._endScale) * 0.125;

      if (this._endScaleDest <= 0 && this._endScale < 0.0000001) {
        //   this.start();
        Collectible.Sounds.scoreboard.stop();
      }

      // Add text
      ctx.save();
      ctx.translate(two.renderer.ratio * two.width / 2, two.renderer.ratio * two.height / 8 + 12);
      ctx.scale(this._endScale, this._endScale);

      var score, i,
        digits = this.scores[0].toString().length, value, osc;

      if (this.index <= 2) {

        for (i = 0; i < Math.min(3, this.scores.length); i++) {

          value = matchDigits(this.scores[i], digits);
          score = (i + 1) + '. ' + value;

          if (i === this.index) {
            score = (i + 1) + '. ' + value;
            osc = 0.0625 * (Math.sin(now / 100) + 1) / 2 + 1;
            ctx.save();
            ctx.scale(osc, osc);
          }

          ctx.fillText(score, 0, i * lineHeight - fontSize / 2);

          if (i === this.index) {
            ctx.restore();
          }

        }

      } else {

        for (i = 0; i < Math.min(2, this.scores.length); i++) {
          value = matchDigits(this.scores[i], digits);
          score = (i + 1) + '. ' + value;
          ctx.fillText(score, 0, i * lineHeight - fontSize / 2);
        }

        ctx.fillText('...', 0, 1.8 * lineHeight - fontSize / 2);

        value = matchDigits(this.scores[this.index], digits);
        score = (this.index + 1) + '. ' + value;
        osc = 0.0625 * (Math.sin(now / 100) + 1) / 2 + 1;
        ctx.save();
        ctx.scale(osc, osc);
        ctx.fillText(score, 0, 3 * lineHeight - fontSize / 2);
        ctx.restore();

      }

      ctx.font = '800 ' + ((fontSize * (15 / 24))) + 'px Sniglet, sans-serif';
      ctx.fillText('LOOK DOWN TO RESTART', 0, 4.5 * lineHeight - fontSize / 2);
      ctx.restore();

    }

    ctx.font = '800 ' + fontSize + 'px Sniglet, sans-serif';

    this._scale += (this._scaleDest - this._scale) * 0.33;

    // Add text
    ctx.save();
    ctx.translate(two.renderer.ratio * two.width / 2, two.renderer.ratio * two.height / 8);
    ctx.scale(this._scale, this._scale);
    ctx.fillText(this.collectible.collected, 0, -fontSize / 2);
    ctx.restore();

    // Update texture
    this.material.map.needsUpdate = true;
    // this.reference.copy(v);

    return this;

  };

  UI.prototype.onCollect = function(coin) {

    this._scale = 0;

  };

  function mod(v, l) {
    while (v < 0) {
      v += l;
    }
    return v % l;
  }

  function matchDigits(score, digits) {
    var s = score.toString();
    var count = Math.max(digits - s.length, 0);
    var p = '';
    for (var i = 0; i < count; i++) {
      p += '0';
    }
    return p + s;
  }

  var colors = [
    {
      r: 85,
      g: 98,
      b: 180
    },
    {
      r: 255,
      g: 100,
      b: 100
    }
  ];

  function lerpColor(t) {

    var a = colors[0];
    var b = colors[1];

    return 'rgb('
      + Math.round(lerp(a.r, b.r, t)) + ','
      + Math.round(lerp(a.g, b.g, t)) + ','
      + Math.round(lerp(a.b, b.b, t)) + ')';

  }

  function lerp(v1, v2, t) {
    return t * (v2 - v1) + v1;
  }

})();