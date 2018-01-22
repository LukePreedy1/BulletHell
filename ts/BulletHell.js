var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var canvas;
var ctx;
var world;
var tickNumber;
// represents the game world
var GameWorld = (function () {
    function GameWorld() {
        this.player = new Player(new Vector(125, 125), new Vector(0, 0));
        this.enemies = new Array();
        this.numEnemies = 0;
        this.bullets = new Array();
        this.numBullets = 0;
    }
    // spawns an enemy at the top of the screen, at a random location
    GameWorld.prototype.spawnEnemy = function () {
        if (this.numEnemies >= 10) {
            return;
        }
        else {
            this.enemies.push(new Enemy(new Vector(Math.floor(Math.random() * canvas.width), 0), new Vector(Math.floor(Math.random() * 10) - 5, Math.floor(Math.random() * 5))));
            this.numEnemies++;
        }
    };
    // draws the current world state
    GameWorld.prototype.drawWorld = function () {
        this.player.draw();
        for (var i = 0; i < this.numEnemies; i++) {
            this.enemies[i].draw();
        }
        for (var i = 0; i < this.numBullets; i++) {
            this.bullets[i].draw();
        }
    };
    // moves all the stuff in the current world state
    GameWorld.prototype.moveWorld = function () {
        this.player.move();
        for (var i = 0; i < this.numEnemies; i++) {
            this.enemies[i].move();
        }
        for (var i = 0; i < this.numBullets; i++) {
            this.bullets[i].move();
        }
    };
    return GameWorld;
})();
function gameLoop() {
    requestAnimationFrame(gameLoop);
    // draws over everything from the last frame
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (tickNumber % 500 == 0) {
        world.spawnEnemy();
        console.log("Spawned new enemy\n");
    }
    if (tickNumber % 4 == 0) {
        world.moveWorld();
    }
    world.drawWorld();
    //ctx.fillStyle = "black";
    //ctx.fillRect(0, 0, 250, 250);
    tickNumber++;
}
window.onload = function () {
    canvas = document.getElementById('cnvs');
    ctx = canvas.getContext("2d");
    world = new GameWorld();
    tickNumber = 0;
    gameLoop();
};
// represents a vector with x and y values
var Vector = (function () {
    function Vector(xx, yy) {
        this.xx = xx;
        this.yy = yy;
        this.x = xx;
        this.y = yy;
    }
    // adds the given Vector to this Vector
    Vector.prototype.addVector = function (other) {
        this.x = this.x + other.x;
        this.y = this.y + other.y;
    };
    return Vector;
})();
// represents a bullet
var Bullet = (function () {
    function Bullet(loc, sp, fr) {
        this.loc = loc;
        this.sp = sp;
        this.fr = fr;
        this.location = loc;
        this.speed = sp;
        this.friendly = fr;
    }
    // moves the current location by the current speed
    Bullet.prototype.move = function () {
        this.location.addVector(this.speed);
    };
    // draws this bullet in the current context.  Green if friendly, Red if not
    Bullet.prototype.draw = function () {
        if (this.friendly) {
            ctx.fillStyle = "green";
        }
        else {
            ctx.fillStyle = "red";
        }
        // the bullet is 2x2 pixels
        ctx.fillRect(this.location.x, this.location.y, 2, 2);
    };
    return Bullet;
})();
// represents a ship, either the player or an enemy
var Ship = (function () {
    function Ship(loc, sp) {
        this.loc = loc;
        this.sp = sp;
        this.location = loc;
        this.speed = sp;
        this.size = new Vector(10, 10); // the size will always remain 10x10 pixels
    }
    // moves the current location by the current speed
    Ship.prototype.move = function () {
        if (0 <= this.location.x + this.speed.x &&
            this.location.x + this.speed.x <= canvas.width) {
            this.location.x += this.speed.x;
        }
        this.location.y += this.speed.y;
    };
    return Ship;
})();
// represents the player's ship
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(loc, sp) {
        _super.call(this, loc, sp);
        this.loc = loc;
        this.sp = sp;
        this.alive = true;
    }
    // draws the player as a blue square
    Player.prototype.draw = function () {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.location.x, this.location.y, this.size.x, this.size.y);
    };
    return Player;
})(Ship);
// represents an enemy ship
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(loc, sp) {
        _super.call(this, loc, sp);
        this.loc = loc;
        this.sp = sp;
    }
    // draws the enemy as a red square
    Enemy.prototype.draw = function () {
        ctx.fillStyle = "red";
        ctx.fillRect(this.location.x, this.location.y, this.size.x, this.size.y);
    };
    return Enemy;
})(Ship);
