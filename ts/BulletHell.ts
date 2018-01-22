var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var world: GameWorld;
var tickNumber: number;

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
    if (this.numEnemies >= 10) {
      return;
    }
    else {
      this.enemies.push(new Enemy(new Vector(Math.floor(Math.random() * canvas.width), 0),
            new Vector(Math.floor(Math.random() * 10) - 5, Math.floor(Math.random() * 5))));
      this.numEnemies++;
    }
  }

  // draws the current world state
  drawWorld(): void {
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
}

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

window.onload = () => {
   canvas = <HTMLCanvasElement>document.getElementById('cnvs');
   ctx = canvas.getContext("2d");
   world = new GameWorld();
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
    // the bullet is 2x2 pixels
    ctx.fillRect(this.location.x, this.location.y, 2, 2);
  }
}


// represents a ship, either the player or an enemy
class Ship {
  location: Vector;
  speed: Vector;
  size: Vector;

  constructor(public loc: Vector, public sp: Vector) {
    this.location = loc;
    this.speed = sp;
    this.size = new Vector(10, 10);    // the size will always remain 10x10 pixels
  }

  // moves the current location by the current speed
  move(): void {
    if (0 <= this.location.x + this.speed.x &&
      this.location.x + this.speed.x <= canvas.width) {
      this.location.x += this.speed.x;
    }
    this.location.y += this.speed.y;
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
    ctx.fillRect(this.location.x, this.location.y, this.size.x, this.size.y);
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
    ctx.fillRect(this.location.x, this.location.y, this.size.x, this.size.y);
  }
}
