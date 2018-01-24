var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var world: GameWorld;
var tickNumber: number;
var lastDownTarget;

// represents the game world
class GameWorld {
  player: Player;
  numEnemies: number;
  enemies: Array<Enemy>;
  numBullets: number;
  bullets: Array<Bullet>;

  constructor() {
    this.player = new Player(new Vector(125, 125), new Vector(0, 0));
    this.enemies = new Array<Enemy>();
    this.numEnemies = 0;
    this.bullets = new Array<Bullet>();
    this.numBullets = 0;
  }

  // spawns an enemy at the top of the screen, at a random location
  spawnEnemy(): void {
    if (this.numEnemies >= 1000) {
      return;
    }
    else {
      this.enemies.push(new Enemy(new Vector(Math.floor(Math.random() * (canvas.width - Ship.size.x)), 0),
            new Vector(Math.floor(Math.random() * 11) - 5, Math.floor(Math.random() * 5)+1)));
      this.numEnemies++;
    }
  }

  // draws the current world state
  drawWorld(): void {
    // first, covers over everything from the last frame
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // then, draws all the elements in the world
    this.player.draw();
    for (let i: number = 0; i < this.numEnemies; i++) {
      this.enemies[i].draw();
    }
    for (let i: number = 0; i < this.numBullets; i++) {
      this.bullets[i].draw();
    }
  }

  // moves all the stuff in the current world state
  moveWorld(): void {
    this.player.move();
    for (let i: number = 0; i < this.numEnemies; i++) {
      this.enemies[i].move();
    }
    for (let i: number = 0; i < this.numBullets; i++) {
      this.bullets[i].move();
    }
  }

  // does various things based on what the input is
  onKeydown(key: string): void {
    if (key === "ArrowUp") {
      this.player.speed.y = -5;
    }
    if (key === "ArrowDown") {
      this.player.speed.y = 5;
    }
    if (key === "ArrowLeft") {
      this.player.speed.x = -5;
    }
    if (key === "ArrowRight") {
      this.player.speed.x = 5;
    }
    if (key === " ") {
      this.bullets.push(this.player.shoot());
      this.numBullets++;
    }
  }

  // undoes the effects of onKeyDown when the key goes up
  onKeyUp(key: string): void {
    if (key === "ArrowUp" || key === "ArrowDown") {
      this.player.speed.y = 0;
    }
    if (key === "ArrowLeft" || key === "ArrowRight") {
      this.player.speed.x = 0;
    }
  }

  // checks if anything is colliding.  If it is, do something about it
  checkCollisions(): void {
    // if the player is touching any bullets, TODO make something happen
    if (this.player.isTouchingBullets(this.bullets, this.numBullets) != -1) {
      alert("The player was hit by a bullet");
    }
    // if an enemy is touching any bullets, TODO make something happen
    for (let i = 0; i < this.numEnemies; i++) {
      if (this.enemies[i].isTouchingBullets(this.bullets, this.numBullets) != -1) {
        alert("An enemy was hit by a bullet");
      }
    }
  }

  // makes enemies have a chance of shooting
  makeEnemiesShoot(): void {
    for (let i = 0; i < this.numEnemies; i++) {
      if (Math.random() >= 0.99) {
        this.bullets.push(this.enemies[i].shoot());
        this.numBullets++;
      }
    }
  }
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (tickNumber % 500 == 0) {
    world.spawnEnemy();
    console.log("Spawned new enemy\n");
  }

  if (tickNumber % 4 == 0) {
    world.moveWorld();
    world.drawWorld();
    world.checkCollisions();
    world.makeEnemiesShoot();
  }

  tickNumber++;
}

// Do this when the page is loaded
window.onload = () => {
  canvas = <HTMLCanvasElement>document.getElementById('cnvs');

  world = new GameWorld();

  // checks what the last part of the page to be clicked was
  document.addEventListener('mousedown', function(event) {
    lastDownTarget = event.target;
  }, false);

  // will only call the keydown function if the canvas was the last thing clicked
  document.addEventListener('keydown', function(event) {
    if (lastDownTarget == canvas) {
      world.onKeydown(event.key);
      console.log(event.key);
    }
  }, false);

  // will negate the keydown effect when the key is up
  document.addEventListener('keyup', function(event) {
    world.onKeyUp(event.key);
  }, false);

  ctx = canvas.getContext("2d");

  tickNumber = 0;

  gameLoop();
}

// represents a vector with x and y values
class Vector {
  x: number;
  y: number;

  constructor(public xx: number, public yy: number) {
    this.x = xx;
    this.y = yy;
  }

  // adds the given Vector to this Vector
  addVector(other: Vector): void {
    this.x = this.x + other.x;
    this.y = this.y + other.y;
  }
}


// represents a bullet
class Bullet {
  location: Vector;
  speed: Vector;
  friendly: boolean;
  static size: Vector = new Vector(5, 5); // A bullet is 2x2 pixels

  constructor(public loc: Vector, public sp: Vector, public fr: boolean) {
    this.location = loc;
    this.speed = sp;
    this.friendly = fr;
  }

  // moves the current location by the current speed
  move(): void {
    this.location.addVector(this.speed);
  }

  // draws this bullet in the current context.  Green if friendly, Red if not
  draw(): void {
    if (this.friendly) {
      ctx.fillStyle = "green";
    }
    else {
      ctx.fillStyle = "red";
    }

    ctx.fillRect(this.location.x, this.location.y, Bullet.size.x, Bullet.size.y);
  }
}


// represents a ship, either the player or an enemy
class Ship {
  location: Vector;
  speed: Vector;
  static size: Vector = new Vector(10, 10);

  constructor(public loc: Vector, public sp: Vector) {
    this.location = loc;
    this.speed = sp;
  }

  // moves the current location by the current speed
  // will stop if the ship hits the side of the canvas
  move(): void {
    if (0 <= this.location.x + this.speed.x &&
      this.location.x + this.speed.x <= (canvas.width - Ship.size.x)) {
      this.location.x += this.speed.x;
    }
    this.location.y += this.speed.y;
  }

  // returns whether or not this ship is touching any of the bullets in the given array
  // returns index of bullet in array it is touching, or -1 if it is not touching any
  isTouchingBullets(bullets: Array<Bullet>, numBullets: number): number {
    for (let i = 0; i < numBullets; i++) {
      // if the two objects are touching, then return the index
      if (bullets[i].location.x <= (this.location.x + Ship.size.x) &&
          (bullets[i].location.x + Bullet.size.x) >= this.location.x &&
          bullets[i].location.y <= (this.location.y + Ship.size.y) &&
          (bullets[i].location.y + Bullet.size.y) >= this.location.y) {
        return i;
      }
    }

    // if none are touching, then return -1
    return -1;
  }
}


// represents the player's ship
class Player extends Ship {
  alive: boolean;

  constructor(public loc: Vector, public sp: Vector) {
    super(loc, sp);
    this.alive = true;
  }

  // draws the player as a blue square
  draw(): void {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.location.x, this.location.y, Ship.size.x, Ship.size.y);
  }

  // moves the player, will stop if you hit the side of the canvas
  move(): void {
    if (0 <= this.location.x + this.speed.x &&
      this.location.x + this.speed.x <= (canvas.width - Ship.size.x)) {
        this.location.x += this.speed.x;
    }
    if (0 <= this.location.y + this.speed.y &&
      this.location.y + this.speed.y <= (canvas.height - Ship.size.y)) {
        this.location.y += this.speed.y;
    }
  }

  // Returns a bullet from the player's location, moving up
  shoot(): Bullet {
    console.log("Shooting a bullet");
    return new Bullet(new Vector(Math.floor(this.location.x + (Ship.size.x/2) - (Bullet.size.x/2)),
                                 this.location.y),
                      new Vector(0, -10), true);
  }

  // Turns off collision for friendly bullets
  isTouchingBullets(bullets: Array<Bullet>, numBullets: number): number {
    var temp: number = super.isTouchingBullets(bullets, numBullets);
    if (temp != -1 && !bullets[temp].friendly) {
      return temp;
    }
    return -1;
  }
}


// represents an enemy ship
class Enemy extends Ship {

  constructor(public loc: Vector, public sp: Vector) {
    super(loc, sp);
  }

  // draws the enemy as a red square
  draw(): void {
    ctx.fillStyle = "red";
    ctx.fillRect(this.location.x, this.location.y, Ship.size.x, Ship.size.y);
  }

  // Turns off collision for enemy bullets
  isTouchingBullets(bullets: Array<Bullet>, numBullets: number): number {
    var temp: number = super.isTouchingBullets(bullets, numBullets);
    if (temp != -1 && bullets[temp].friendly) {
      return temp; 
    }
    return -1;
  }

  // Returns a bullet moving down from the location of the Enemy
  shoot(): Bullet {
    console.log("Enemy is shooting a bullet");
    return new Bullet(new Vector(Math.floor(this.location.x + (Ship.size.x/2) - (Bullet.size.x/2)),
                                 this.location.y + Ship.size.y),
                      new Vector(0, 10), false);
  }
}
