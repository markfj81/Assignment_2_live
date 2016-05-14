// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.5;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp); // change the image every tick , usually, wallDelta = 0.00032
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    //console.log(this.gameTime);
    return gameDelta;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getXandY(e) {
    var x = e.clientX;
    var y = e.clientY - 100; //canvas.dy = 100
    return { x: x, y: y };
}

//------------------------------------------------------------------------------------
function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keyCode = 0;
    this.space = false;
      
 }




GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (e.which >= 37 && e.which <= 40) {
            that.keyCode = e.which;
            that.arrow = true;
        } else if (e.which === 32) {
            that.space = true;
        } else if (e.which === 80) {
            that.pause = !that.pause;
        }
        if (String.fromCharCode(e.which) === ' ') that.space = true;
        //console.log(e);
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (e.which >= 37 && e.which <= 40 && e.which === that.keyCode) {
            that.arrowRelesed = true;
            that.arrow = false;
            that.space = false;
            that.keyCode = 0;
        }
        //console.log(e);
        e.preventDefault();
    }, false);
    console.log('Input started');

    this.ctx.canvas.addEventListener("click", function (e) {
        //console.log(getXandY(e));
        that.click = getXandY(e);
    }, false);
}

GameEngine.prototype.addEntity = function (entity) {
    //console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.update = function () {
    
        var entitiesCount = this.entities.length;
        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];
            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
                //console.log("removed entity")
            }
        }
}

GameEngine.prototype.draw = function () {
   
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick() / 20; //slow down the motion
    //console.log(this.clockTick);
    this.update();
    this.draw();
    //this.space = null;
}