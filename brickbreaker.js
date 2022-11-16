let SCREEN_WIDTH = 500;
let SCREEN_HEIGHT = 500;

let PLAYFIELD_MAXWIDTH = SCREEN_WIDTH * 0.85;
let PLAYFIELD_MAXHEIGHT = SCREEN_HEIGHT * 0.85;

let PLAYFIELD_MINWIDTH = (SCREEN_WIDTH - PLAYFIELD_MAXWIDTH) / 2;
let PLAYFIELD_MINHEIGHT = (SCREEN_HEIGHT - PLAYFIELD_MAXHEIGHT) / 2;

let INIT_BALL_SPEED = 5;
let ballList = [];
let brickList = [];
let powerupList = [];

let score = 0;
let lives = 3;

let playerHasGuns = false;
let playerGunTimer = 30;

let INIT_PLAYER_SIZE = SCREEN_WIDTH / 7;

function setup() {
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  frameRate(60);
  
  powerupList.push(new Powerup(-100,100,0));

  player = new Paddle(PLAYFIELD_MAXWIDTH/2, PLAYFIELD_MAXHEIGHT, int(INIT_PLAYER_SIZE), 15);
  ballList.push(new Ball(PLAYFIELD_MAXWIDTH/2,PLAYFIELD_MAXHEIGHT - 15-player.sizeY));
  
  //create basic level
  brickX = 100;
  brickY = 100;
  for(let i = 0; i < 7; i++) {
    brick = new Brick(brickX, brickY, color(0,255,255), 1);
    brickList.push(brick);
    brickX += brick.width;
  }
  brickX = 100;
  brickY = 120;
  for(let i = 0; i < 7; i++) {
    brick = new Brick(brickX, brickY, color(255,255,0), 1);
    brickList.push(brick);
    brickX += brick.width;
  }
  brickX = 100;
  brickY = 140;
  for(let i = 0; i < 7; i++) {
    brick = new Brick(brickX, brickY, color(255,0,255), 1);
    brickList.push(brick);
    brickX += brick.width;
  }
}

function splitBall(ball) {
  ballList.push(new Ball(ball.position.x, ball.position.y, ball.velocity.x,(ball.velocity.y * -1) ));
  //console.log("SPLIT BALL! BALL COUNT: " + ballList.length);
}

function draw() {
  //frameRate(60);
  background(200);
  push();
  fill(0);
  textSize(24);
  text("Score: " + score, PLAYFIELD_MINWIDTH, 25);
  pop();
  
  push();
  fill(50,50,255);
  let livesX = SCREEN_WIDTH - 75;
  let livesY = SCREEN_HEIGHT - 25;
  for (let l = 0; l < lives; l++) {
    rect(livesX, livesY, 40, 10);
    livesX -= 50;
  }
  pop();
  
  push();
  fill(0);
  textSize(24);
  //text("Ball Count: " + ballList.length, PLAYFIELD_MINWIDTH, SCREEN_HEIGHT-5);
  pop();
    
  push();
  strokeWeight(3);
  fill(220);
  rect(PLAYFIELD_MINWIDTH, PLAYFIELD_MINHEIGHT, PLAYFIELD_MAXWIDTH, PLAYFIELD_MAXHEIGHT);
  pop();
  
  push();
  for(let b = 0; b < brickList.length; b++) {
    brickList[b].draw();
  }
  pop();
  
  let w;
  for (let b = ballList.length-1; b >= 0; b--) {
    w = [checkWallCollision(ballList[b]), ballList[b]];
    for (let c = brickList.length-1; c >= 0; c--) {
      if(checkBrickCollision(ballList[b], brickList[c])) {
        //console.log("BRICK HIT");
        brickList[c].health--;
        if(brickList[c].health <= 0) {
          if(brickList[c].containsPowerUp) {
            //generate
            //console.log("ADD POWERUP");
            let powUpNum = int(random(1,3));
            let powUpGood = true;
            if(powUpNum == 1) {
              powUpGood = true;
            }
            else if(powUpNum == 2) {
              powUpGood = false;
            }
            powerupList.push(new Powerup(brickList[c].position.x,brickList[c].position.y,powUpNum,powUpGood));
          }
          score += 100;
          brickList.splice(c,1);
        }
        break;
      }
      if(w > 0) {
        break;
      }
    }
    checkPaddleCollision(ballList[b]);
  }
  
  for (let p = powerupList.length-1; p > 0; p--) {
    //console.log(powerupList.length);
    let powerUpCollected = checkPowerupCollision(powerupList[p], player);
    if(powerUpCollected) {
      if(powerupList[p].type == 1) {
        //console.log("POWERUP COLLECTED");
        // size UP
        if(player.sizeX+20 <= player.maxSize) { 
          console.log("SIZE UP");
          player.sizeX += 20;
        }
        else {
          player.sizeX = player.maxSize;
        }
        powerupList.splice(p,1);
      }
      else if(powerupList[p].type == 2) {
        if(player.sizeX-20 >= player.minSize) {
          console.log("SIZE DOWN");
          player.sizeX -= 20;
        }
        else {
          player.sizeX = player.minSize;
        }
        powerupList.splice(p,1);
      }
    }
  }
  
  for (let b = 0; b < ballList.length; b++) {
    ballList[b].update();
    ballList[b].draw();
  }
  
   for (let p = powerupList.length-1; p > 0; p--) {
    if(powerupList[p].position.y > player.position.y + player.sizeY)     {
      powerupList.splice(p,1);
      break;
    }
    powerupList[p].update();
    powerupList[p].draw();
  }
  
  push();
  player.draw();
  player.update(PLAYFIELD_MINWIDTH,(SCREEN_WIDTH - PLAYFIELD_MINWIDTH)-player.sizeX);
  pop();
  
  // Check Timers
  if(playerHasGuns) {
    if (frameCount % 60 == 0 && playerGunsTimer > 0) {
      playerGunsTimer--;
    }
    // end player guns
    if (playerGunsTimer == 0) {

    }
  }
  
} // END DRAW LOOP

function checkPowerupCollision(powerup, player) {
  let r1x = powerup.position.x;
  let r1w = powerup.width;
  let r1y = powerup.position.y;
  let r1h = powerup.height;
  
  let r2x = player.position.x;
  let r2w = player.sizeX;
  let r2y = player.position.y;
  let r2h = player.sizeY;
  
  
  if (r1x + r1w >= r2x &&     // r1 right edge past r2 left
  r1x <= r2x + r2w &&       // r1 left edge past r2 right
  r1y + r1h >= r2y &&       // r1 top edge past r2 bottom
  r1y <= r2y + r2h) {       // r1 bottom edge past r2 top
    return true;
}
return false;
}

function checkBrickCollision(ball,brick) { 
  let cx = ball.position.x;
  let cy = ball.position.y;
  let rad = ball.r;
  let rx = brick.position.x;
  let ry = brick.position.y;
  let rw = brick.width;
  let rh = brick.height;
  
  let testX = cx;
  let testY = cy;

  // test left edge
  if (cx < rx) {
    testX = rx;
  }
  // test right edge
  else if (cx > rx+rw) {
    testX = rx+rw;
  }
  // test top edge
  if (cy < ry) {
    testY = ry;
  }
  // test bottom edge
  else if (cy > ry+rh) {
    testY = ry+rh;   
  }
  
  let d = dist(cx, cy, testX, testY);
  
    if (d <= rad) {
      // COLLISION HAPPENED BETWEEN BALL AND BRICK
      // DETERMINE WHICH SIDE WAS HIT
      // 
      // Calculate line from ball center to brick center
      // check intersection between all sides of brick to find
      // which side was hit and bounce accordingly
      
      //let brickTopLine = line(rx, ry, rx+rw, ry);
      //let brickRightLine = line(rx+rw, ry, rx+rw, ry+rh);
      //let brickBottomLine = line(rx, ry+rh, rx+rw, ry+rh);
      //let brickLeftLine = line(rx,ry,rx,ry+rh);
      //let ballLine = line(cx,cy,rx+rw/2,ry+rh/2);
      
      // check top collision
      if(checkLineCollision(cx,cy,rx+rw/2,ry+rh/2,rx, ry, rx+rw, ry)) {
        //console.log("Hit Top");
        ball.velocity.y *= -1;
      }
      // check right collision
      else if(checkLineCollision(cx,cy,rx+rw/2,ry+rh/2,rx+rw, ry, rx+rw, ry+rh)) {
        //console.log("Hit Right");
        ball.velocity.x *= -1;
      }
      // check bottom collision
      else if(checkLineCollision(cx,cy,rx+rw/2,ry+rh/2,rx, ry+rh, rx+rw, ry+rh)) {
        //console.log("Hit Bottom");
        ball.velocity.y *= -1;
      }
      // check left collision
      else if(checkLineCollision(cx,cy,rx+rw/2,ry+rh/2,rx,ry,rx,ry+rh)) {
        //console.log("Hit Left");
        ball.velocity.x *= -1;
      }
      
    return true;
  }
  return false;

} // END check Brick Collision

function checkLineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
  //boolean lineLine(float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4) {

  // calculate the distance to intersection point
  let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return true;
  }
  return false;
}

function checkWallCollision(ball) {
    // check right wall
  if(ball.position.x + ball.r > (PLAYFIELD_MAXWIDTH + PLAYFIELD_MINWIDTH) )  {
  ball.position.x = (PLAYFIELD_MAXWIDTH + PLAYFIELD_MINWIDTH) - ball.r;
  ball.velocity.x *= -1;
    return 1;
  }
  // check left wall
  else if(ball.position.x - ball.r < PLAYFIELD_MINWIDTH) {
    ball.position.x = PLAYFIELD_MINWIDTH + ball.r;
    ball.velocity.x *= -1;
    return 2;
  }
  // check top wall
  else if(ball.position.y - ball.r < PLAYFIELD_MINHEIGHT) {
    ball.position.y = PLAYFIELD_MINHEIGHT + ball.r;
    ball.velocity.y *= -1;
    return 3;
  }
  // check bottom wall
  else if(ball.position.y + ball.r > (PLAYFIELD_MAXHEIGHT + PLAYFIELD_MINHEIGHT) ) {
    ball.position.y = PLAYFIELD_MAXHEIGHT + PLAYFIELD_MINHEIGHT - ball.r;
    ball.velocity.y *= -1;
    return 4;
  }
  else
    return 0;
}

function checkPaddleCollision(b) {
  // first see if ball is at same y position as paddle
  
  if(b.position.y + b.r >= player.position.y) {
    if(int(b.position.x) - b.r >= player.position.x && int(b.position.x) + b.r <= player.position.x + player.sizeX) {
      
      b.position.y = player.position.y - b.r
      
      let reflectAngle = map(int(b.position.x), player.position.x, player.position.x + player.sizeX, 60, -60);
      b.velocity.x = b.speed * -sin(radians(reflectAngle));
      b.velocity.y = b.speed * -cos(radians(reflectAngle));
      return true;
    }
    return false;
  }
  return false;
}

class Brick {
  
  constructor(x, y, col, health) {
    this.position = new p5.Vector(x, y);
    this.health = health;
    this.color = col;
    this.width = 40;
    this.height = 20;

    let powerUpChance = random();
    if(powerUpChance < 0.9) {
      this.containsPowerUp = true;
    } else {
      this.containsPowerUp = false;
    }
  }
  
  draw() {
    fill(50, 50, 50);
    rect(this.position.x, this.position.y, this.width, this.height);
    fill(this.color);
    rect(this.position.x, this.position.y, this.width, this.height);
    
    if(this.containsPowerUp) {
      fill(0);
      text("P", this.position.x+this.width/2-5, this.position.y+this.height/2+5);
    }
  }
}

class Ball {
  
  constructor(x, y, velx=1, vely=1) {
    this.position = new p5.Vector(x, y);
    //this.velocity = p5.Vector.random2D();
    this.velocity = new p5.Vector(velx,vely);
    this.speed = 3;
    this.velocity.mult(this.speed);
    this.r = 5;
    this.m = this.r * 0.1;
  }
  
  draw() {
    fill(50, 50, 50);
    circle(this.position.x, this.position.y, this.r*2 + 2)
    fill(255,255,255);
    circle(this.position.x, this.position.y, this.r*2);
  }
  
  update() {
    this.position.add(this.velocity);
  }
}

class Powerup {
  // score multiplier?
  // no ball loss - adds temp bar to reflect ball
  // gun powerup
  // multiball
  // extra life
  // size UP
  // size DOWN
  
  constructor(x, y, type, gb) {
    this.position = new p5.Vector(x, y);
    this.type = type;
    this.velocity = new p5.Vector(0,1);
    this.speed = 2;
    this.velocity.mult(this.speed);
    this.width = 40;
    this.height = 20;
    this.good = gb;
  }
  
  draw() {
    if(this.good) {
      fill(0,255,0);
    }
    else {
      fill(255,0,0);
    }
    rect(this.position.x, this.position.y, this.width, this.height);
  }
  
  update() {
    this.position.add(this.velocity);
  }
}

class Paddle {
  
  constructor(x, y, sizeX, sizeY) {
    this.position = new p5.Vector(x, y);
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    
    this.maxSize = SCREEN_WIDTH/4+INIT_PLAYER_SIZE;
    this.minSize = 40;
  }
  
  draw() {
    fill(50, 50, 50);
    rect(this.position.x, this.position.y, this.sizeX, this.sizeY)
    fill(50,50,255);
    rect(this.position.x, this.position.y, this.sizeX, this.sizeY);
  }
  
  update(leftWall,rightWall) {
    this.position.x = constrain(mouseX, leftWall+2, rightWall-2);
  }
}