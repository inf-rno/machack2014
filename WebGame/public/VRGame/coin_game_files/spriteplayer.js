(function(global) {

  function SpritePlayer(srcs, domElement) {
    this._imgs = [];
    Promise.all(srcs.map(get)).then(function(imgs) {
      this._imgs = imgs;
      // set the size equal to the first image
      var i = this._imgs[0];
      if (i) {
        // this.setSize(i.width,i.height);
      }
      this._preRender();
      this.onload();
    }.bind(this));
    this.domElement = domElement || document.createElement('canvas');
    this._ctx = this.domElement.getContext('2d');
    var animate = this.animate.bind(this);
    this.animate = function() {
      requestAnimationFrame(animate);
    };
  }

  // frame rate in fps
  SpritePlayer.prototype.fps = 24;
  SpritePlayer.prototype.loop = true;

  // the current frame index
  SpritePlayer.prototype._index = 0;

  SpritePlayer.prototype._lastTimestamp = undefined;
  SpritePlayer.prototype._playing = false;
  SpritePlayer.prototype._needsUpdate = false;

  SpritePlayer.prototype._width = 0;
  SpritePlayer.prototype._height = 0;

  // override callback
  SpritePlayer.prototype.onload = function() {}

  SpritePlayer.prototype.reset = function() {
    this._index = 0;
    return this;
  }

  SpritePlayer.prototype._preRender = function() {
    this._imgs.forEach(function(img) {
      this._ctx.drawImage(img, 0, 0, this._width, this._height);
    });
    this._ctx.clearRect(0, 0, this._width, this._height);
    return this;
  }

  // update loop to pick the current frame based on framerate
  SpritePlayer.prototype.update = function() {
    if (this._imgs.length === 0) {
      return this;
    }
    var now = Date.now();
    this._lastTimestamp = this._lastTimestamp || now;
    var dt = now - this._lastTimestamp;
    this._needsUpdate = false;
    if (dt > 1000 / this.fps) {
      this._lastTimestamp = now;
      this._index += 1;
      this._needsUpdate = true;
    }
    if (this.loop) {
      this._index %= this._imgs.length;
    } else {
      if (this._index >= this._imgs.length) {
        this._index = 0;
        this.pause();
      }
    }
    return this;
  }

  SpritePlayer.prototype.render = function() {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._ctx.drawImage(this._imgs[this._index], 0, 0, this._width, this._height);
    return this;
  }

  SpritePlayer.prototype.animate = function() {
    this.update();
    if (this._needsUpdate) {
      this.render();
    }
    if (this._playing) {
      requestAnimationFrame(this.animate.bind(this))
    }
    return this;
  }

  SpritePlayer.prototype.play = function() {
    this._playing = true;
    this.animate();
    return this;
  }

  SpritePlayer.prototype.pause = function() {
    this._playing = false;
    this._lastTimestamp = undefined;
    return this;
  }

  SpritePlayer.prototype.setSize = function(width, height) {
    this._width = width;
    this._height = height;
    this.domElement.width = width;
    this.domElement.height = height;
    return this;
  }

  function get(url) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.src = url;
        img.onload = function() {
          resolve(img);
        }
        img.onerror = function() {
          reject(Error('Failed to load.'));
        }
      });
  }

  global.SpritePlayer = SpritePlayer;

})(window);