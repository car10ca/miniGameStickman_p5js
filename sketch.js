//this game was produced by Kerstin Kegel in 2020
//Happy playing!

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isDeadEnd;

var clouds;
var mountains;
var trees_x;
var collectable;
var canyon;
var platforms;

var game_score;
var flagpole;
var lives;
var token_x;
var deadEndWall; //extra implementation: dead end


var jumpSound;
var collectableSound;
var dieSound;
var gameplaySound;
var alertSound;
var winSound;



function preload() {
    soundFormats('mp3', 'wav');

    //pre-loading all game sounds
    jumpSound = loadSound('sounds/jump.wav');
    collectableSound = loadSound('sounds/collected.wav');
    dieSound = loadSound('sounds/gameover.wav');
    gameplaySound = loadSound('sounds/gameplay.mp3');
    alertSound = loadSound('sounds/alert.wav');
    winSound = loadSound('sounds/win.mp3');
}



function setup() {
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    lives = 3;
    startGame();
}



function draw() {
    token_x = 200;
    background(100, 155, 255);
    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, width, height / 4);

    push();

    translate(scrollPos, 0);

    //call draw functions for clouds, mountains, trees and special implementation, dead end wall
    drawClouds();
    drawMountains();
    drawTrees();
    drawDeadEndWall();

    //loop draw platforms
    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    //loop draw canyons
    for (var j = 0; j < canyon.length; j++) {
        drawCanyon(canyon[j]);
        checkCanyon(canyon[j]);
    }

    //loop drawing collectables
    for (var i = 0; i < collectable.length; i++) {
        if (!collectable[i].isFound) {
            checkCollectable(collectable[i]);
            drawCollectable(collectable[i]);
        }
    }

    //call functions to check flagpole, player death and extra implementation: dead end
    renderFlagpole();
    checkPlayerDie();
    checkDeadEnd();

    pop();

    //call function to draw game character
    drawGameChar();


    //text on top left screen for Score info
    fill(255);
    noStroke;
    strokeWeight(0);
    textSize(15);
    textAlign(LEFT);
    text("Score: " + game_score, 20, 17);

    //text for gameplay music controls, top right on screen
    textSize(12);
    text("Music On? Press Y", 890, 17);
    text("Music Off? Press N", 890, 34);

    //text for info on lives on top left of screen
    fill(255);
    strokeWeight(0);
    noStroke;
    textSize(15);
    textStyle(NORMAL);
    textAlign(LEFT);
    text("Lives: " + lives, 100, 17);

    //produce red circles as life tokens on top left of screen
    for (var t = 0; t < lives; t++) {
        fill(220, 20, 60);
        stroke(255);
        strokeWeight(2);
        ellipse(token_x, 11, 15, 15);
        token_x += 30;
    }


    // GAME LOGIC

    //when lives = 0, make screen black and display text message
    if (lives == 0) {
        fill(0);
        rect(0, 0, width, height);//make screen blank when all lives lost
        fill(255);
        noStroke;
        textSize(34);
        textAlign(CENTER);
        text("Game over. Press space to continue.", width / 2, height / 2);
        return;
    }

    //if flagpole has been reached, raise flag and display "level completed" message
    if (flagpole.isReached) {
        fill(255);
        noStroke;
        textSize(34);
        textAlign(CENTER);
        text("Level complete. Press space to continue.", width / 2, height / 2);
        return;
    }

    //move character left
    if (isLeft) {
        if (gameChar_x > width * 0.2) {
            gameChar_x -= 4;
        }
        else {
            scrollPos += 5;
        }
    }

    //move character right
    if (isRight) {
        if (gameChar_x < width * 0.8) {
            gameChar_x += 4;
        }
        else {
            scrollPos -= 5;
        }
    }

    //check if character is on platform
    if (gameChar_y != floorPos_y) {
        var isContact = false;
        //isFalling = true;
        for (var i = 0; i < platforms.length; i++) {
            if (platforms[i].checkContact(gameChar_world_x, gameChar_y) == true) {
                isContact = true;
                isFalling = false;// makes sure character is front facing when on platform
                break;
            }
        }
        if (isContact == false) {
            gameChar_y += 1;
            isFalling = true;
            isPlummeting = false;
        }
    }
    else {
        isFalling = false;
    }

    //plummeting into the canyon
    if (isPlummeting == true) {
        gameplaySound.stop(); //stop gameplay music when plummeting..
        dieSound.play(); //.. play dieStound instead
        isFalling = false;
        gameChar_y += 5;
    }

    //block character from moving left when dead end has been reached
    if (isDeadEnd == true) {
        isLeft = false;
        isFalling = false;
    }

    //normal flagpole status: flag on ground 
    if (flagpole.isReached == false) {
        checkFlagpole();
    }

    gameChar_world_x = gameChar_x - scrollPos;
}


//character lives calculation
function checkPlayerDie() {
    if (gameChar_y >= height && lives > 0) {
        lives = lives - 1;
        startGame();
    }
}


//when key pressed:
function keyPressed() {
    //left arrow pressed: move left
    if (keyCode == 37) {
        isLeft = true;
    }

    //right arrow pressed: move right
    else if (keyCode == 39) {
        isRight = true;
    }

    //if left arrow pressed whilst player is at dead end
    if (keyCode == 37 && isDeadEnd == true) {
        //when reaching dead end and repeatedly pressing left arrow, character passed dead end, below stop this from happening
        gameChar_x += 5;
    }

    if (keyCode == 32 && lives > 0) //previous code incl "gameChar_y == floorPos_y" <-- stopped char from jumping when on platform
    {
        //when lives larger than 0 and space bar is pressed 
        //then if player is not falling
        if (!isFalling) {
            gameChar_y -= 100;
            jumpSound.play(); //play jump sound
        }
    }

    //if Y pressed and !plummeting, loop gameplay music
    if (keyCode == 89 && isPlummeting == false) {
        gameplaySound.loop();
    }

    //if N pressed, stop gameplay music  
    if (keyCode == 78) {
        gameplaySound.stop();
    }
}

//when key released:
function keyReleased() {
    if (keyCode == 37) //stop moving left when releasing left arrow
    {
        isLeft = false;
    }
    else if (keyCode == 39) //stop moving right when releasing right arrow
    {
        isRight = false;
    }

    //pressing space...
    if (keyCode == 32) {
        //...when score and lives = 0
        if (lives == 0 && game_score == 0) {
            location.reload(); //calling startGame() didn't work, refreshing browser window instead
        }

        //if flagpole has been reached:
        if (flagpole.isReached == true) {
            startGame();//restart game once space has been pressed after reaching flagpole
            winSound.stop(); //stops winning sound from playing if space was pressed prior to win sound finishing
            alertSound.play(); //play alert sound when new game starts
        }
    }
}


function drawGameChar() {
    //drawing character when falling left
    if (isLeft && isFalling) {
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x - 6, gameChar_y - 20, gameChar_x - 13, gameChar_y - 10);
        line(gameChar_x - 13, gameChar_y - 10, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 3, gameChar_y - 20, gameChar_x - 3, gameChar_y - 10);
        line(gameChar_x - 3, gameChar_y - 10, gameChar_x + 6, gameChar_y - 3);
        noStroke();
        fill(0);
        ellipse(gameChar_x - 8, gameChar_y - 61, 18, 20);
        fill(236, 179, 203);
        rect(gameChar_x - 10, gameChar_y - 50, 18, 25);
        fill(198, 114, 157);
        rect(gameChar_x - 9, gameChar_y - 50, 4, 19);
        rect(gameChar_x - 10, gameChar_y - 31, 18, 11);
        fill(76, 20, 65);
        triangle(gameChar_x - 10, gameChar_y - 50, gameChar_x - 10, gameChar_y - 38, gameChar_x, gameChar_y - 50);
        strokeWeight(4);
        stroke('rgb(0,0,0)');
        line(gameChar_x, gameChar_y - 40, gameChar_x + 15, gameChar_y - 60);
    }

    //drawing character when falling right
    else if (isRight && isFalling) {
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x + 1, gameChar_y - 10, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x - 6, gameChar_y - 20, gameChar_x + 1, gameChar_y - 10);
        line(gameChar_x + 11, gameChar_y - 10, gameChar_x + 4, gameChar_y - 3);
        line(gameChar_x + 4, gameChar_y - 20, gameChar_x + 11, gameChar_y - 10);
        noStroke();
        fill(0);
        ellipse(gameChar_x + 8, gameChar_y - 61, 18, 20);
        fill(236, 179, 203);
        rect(gameChar_x - 10, gameChar_y - 50, 18, 25);
        fill(198, 114, 157);
        rect(gameChar_x + 3, gameChar_y - 50, 4, 19);
        rect(gameChar_x - 10, gameChar_y - 31, 18, 11);
        fill(76, 20, 65);
        triangle(gameChar_x + 8, gameChar_y - 50, gameChar_x + 8, gameChar_y - 38, gameChar_x - 2, gameChar_y - 50);
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x, gameChar_y - 40, gameChar_x - 15, gameChar_y - 60);
    }

    //drawing character when walking left
    else if (isLeft) {
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x - 6, gameChar_y - 20, gameChar_x - 16, gameChar_y - 3);
        line(gameChar_x + 3, gameChar_y - 20, gameChar_x - 3, gameChar_y - 10);
        line(gameChar_x - 3, gameChar_y - 10, gameChar_x + 6, gameChar_y - 3);
        noStroke();
        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 61, 18, 20);
        fill(236, 179, 203);
        rect(gameChar_x - 10, gameChar_y - 50, 18, 25);
        fill(198, 114, 157);
        rect(gameChar_x - 9, gameChar_y - 50, 4, 19);
        rect(gameChar_x - 10, gameChar_y - 31, 18, 11);
        fill(76, 20, 65);
        triangle(gameChar_x - 10, gameChar_y - 50, gameChar_x - 10, gameChar_y - 38, gameChar_x, gameChar_y - 50);
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x, gameChar_y - 35, gameChar_x, gameChar_y - 43);
        line(gameChar_x, gameChar_y - 35, gameChar_x - 5, gameChar_y - 30);
    }

    //drawing character when walking right
    else if (isRight) {
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x + 1, gameChar_y - 10, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x - 6, gameChar_y - 20, gameChar_x + 1, gameChar_y - 10);
        line(gameChar_x + 4, gameChar_y - 20, gameChar_x + 15, gameChar_y - 2);
        noStroke();
        fill(0);
        ellipse(gameChar_x, gameChar_y - 61, 18, 20);
        fill(236, 179, 203);
        rect(gameChar_x - 10, gameChar_y - 50, 18, 25);
        fill(198, 114, 157);
        rect(gameChar_x + 3, gameChar_y - 50, 4, 19);
        rect(gameChar_x - 10, gameChar_y - 31, 18, 11);
        fill(76, 20, 65);
        triangle(gameChar_x + 8, gameChar_y - 50, gameChar_x + 8, gameChar_y - 38, gameChar_x - 2, gameChar_y - 50);
        strokeWeight(4);
        stroke(0, 0, 0);
        line(gameChar_x - 2, gameChar_y - 35, gameChar_x - 2, gameChar_y - 43);
        line(gameChar_x - 2, gameChar_y - 35, gameChar_x + 3, gameChar_y - 30);
    }

    //drawing character when either falling or plummeting
    else if (isFalling || isPlummeting) {
        strokeWeight(5);
        stroke(0, 0, 0);
        line(gameChar_x - 10, gameChar_y - 50, gameChar_x - 20, gameChar_y - 70);
        line(gameChar_x + 9, gameChar_y - 50, gameChar_x + 18, gameChar_y - 70);
        line(gameChar_x - 6, gameChar_y - 20, gameChar_x - 16, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 20, gameChar_x + 16, gameChar_y - 3);
        noStroke();
        fill(0);
        ellipse(gameChar_x, gameChar_y - 61, 20, 20);
        fill(236, 179, 203);
        rect(gameChar_x - 10, gameChar_y - 50, 20, 25);
        fill(198, 114, 157);;
        rect(gameChar_x - 8, gameChar_y - 50, 4, 19);
        rect(gameChar_x + 4, gameChar_y - 50, 4, 19);
        rect(gameChar_x - 10, gameChar_y - 31, 20, 11);
        fill(76, 20, 65);
        ellipse(gameChar_x - 6, gameChar_y - 30, 2, 2);
        ellipse(gameChar_x + 6, gameChar_y - 30, 2, 2);
        triangle(gameChar_x - 10, gameChar_y - 50, gameChar_x, gameChar_y - 38, gameChar_x + 10, gameChar_y - 50);
    }

    //drawing character for front view - standstill
    else {
        strokeWeight(5);
        stroke(0, 0, 0);
        line(gameChar_x - 10, gameChar_y - 48, gameChar_x - 20, gameChar_y - 40);
        line(gameChar_x - 20, gameChar_y - 40, gameChar_x - 10, gameChar_y - 33);
        line(gameChar_x + 10, gameChar_y - 48, gameChar_x + 20, gameChar_y - 40);
        line(gameChar_x + 20, gameChar_y - 40, gameChar_x + 10, gameChar_y - 33);
        line(gameChar_x - 6, gameChar_y - 20, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 20, gameChar_x + 6, gameChar_y - 3);
        noStroke();
        fill(0);
        ellipse(gameChar_x, gameChar_y - 61, 20, 20);
        fill(236, 179, 203);
        rect(gameChar_x - 10, gameChar_y - 50, 20, 25);
        fill(198, 114, 157);;
        rect(gameChar_x - 8, gameChar_y - 50, 4, 19);
        rect(gameChar_x + 4, gameChar_y - 50, 4, 19);
        rect(gameChar_x - 10, gameChar_y - 31, 20, 11);
        fill(76, 20, 65);
        ellipse(gameChar_x - 6, gameChar_y - 30, 2, 2);
        ellipse(gameChar_x + 6, gameChar_y - 30, 2, 2);
        triangle(gameChar_x - 10, gameChar_y - 50, gameChar_x, gameChar_y - 38, gameChar_x + 10, gameChar_y - 50);
    }
}


//drawing clouds
function drawClouds() {
    for (var i = 0; i < clouds.length; i++) {
        fill(128, 198, 230);
        ellipse(clouds[i].x_pos + 240, clouds[i].y_pos + 75, clouds[i].size, clouds[i].size - 20);
        ellipse(clouds[i].x_pos + 220, clouds[i].y_pos + 90, clouds[i].size - 10, clouds[i].size - 40);
        ellipse(clouds[i].x_pos + 260, clouds[i].y_pos + 90, clouds[i].size + 10, clouds[i].size - 30);
        fill(201, 227, 231);
        ellipse(clouds[i].x_pos + 180, clouds[i].y_pos + 65, clouds[i].size - 30, clouds[i].size - 40);
        ellipse(clouds[i].x_pos + 160, clouds[i].y_pos + 80, clouds[i].size - 30, clouds[i].size - 60);
        ellipse(clouds[i].x_pos + 200, clouds[i].y_pos + 80, clouds[i].size - 10, clouds[i].size - 50);
    }
}


//factory pattern function:
//draw platforms & check if character is in contact with platform
function createPlatforms(x, y, length) {
    var p =
    {
        x: x,
        y: y,
        length: length,
        draw: function () {
            noStroke();
            fill(81, 159, 152);
            rect(this.x - 5, this.y + 10, this.length + 10, 6, 3);
            fill(64, 126, 120);
            rect(this.x - 5, this.y + 10, this.length - (this.length / 100 * 80), 6, 3);
            fill(76, 84, 168)
            rect(this.x, this.y + 16, this.length, 18);
            fill(65, 64, 146);
            rect(this.x, this.y + 16, this.length / 8, 18);

        },

        checkContact: function (gc_x, gc_y) {
            if (gc_x > this.x && gc_x < this.x + this.length) {
                var d = this.y - (gc_y - 10);// deduct 10px of char y pos to land directly on platform 
                if (d > 0 && d < 2) {

                    return true;
                }
            }
            return false;
        }
    }
    return p;
}

//draw mountains
function drawMountains() {
    for (var i = 0; i < mountains.length; i++) {
        fill('#c1c5d6');
        triangle(mountains[i].x_pos + 170, 432, mountains[i].x_pos + 280, 140, mountains[i].x_pos + 300 + mountains[i].width, 432);
        fill('#787fa0');
        triangle(mountains[i].x_pos + 390, 432, mountains[i].x_pos + 280, 140, mountains[i].x_pos + 390 + mountains[i].width, 432);
    }
}

//draw trees
function drawTrees() {
    for (var i = 0; i < trees_x.length; i++) {
        fill(168, 13, 34);
        strokeWeight(0);
        rect(trees_x[i], floorPos_y, 10, -90);
        fill(149, 214, 62);
        ellipse(trees_x[i] + 8, floorPos_y - 47, 130, 70);
        ellipse(trees_x[i] + 5, floorPos_y - 76, 100, 60);
        ellipse(trees_x[i] + 4, floorPos_y - 116, 70, 40);
        ellipse(trees_x[i] + 4, floorPos_y - 140, 40, 30);
        stroke(212, 0, 65);
        strokeWeight(8);
        point(trees_x[i], 340);
        point(trees_x[i] + 10, floorPos_y - 120);
        point(trees_x[i] - 10, floorPos_y - 90);
        point(trees_x[i] + 40, floorPos_y - 70);
        point(trees_x[i] - 35, floorPos_y - 50);
        point(trees_x[i] + 34, floorPos_y - 25);
        point(trees_x[i] + 10, floorPos_y - 50);
    }
}


//draw canyons
function drawCanyon(t_canyon) {
    strokeWeight(0);

    fill(0, 126, 0);
    rect(t_canyon.x_pos, floorPos_y, t_canyon.width, 143);
    fill(0, 72, 0);
    rect(t_canyon.x_pos - 10, floorPos_y, t_canyon.width - 11, 143);
    fill(0, 155, 0);
    triangle(t_canyon.x_pos + 59, floorPos_y, t_canyon.x_pos + 80, floorPos_y + 20, t_canyon.x_pos + 80, floorPos_y);
    fill(0, 155, 0);
    triangle(t_canyon.x_pos - 10, floorPos_y, t_canyon.x_pos + 6, floorPos_y + 20, t_canyon.x_pos - 10, floorPos_y + 20);
    fill(0, 155, 0);
    rect(t_canyon.x_pos - 10, floorPos_y + 20, t_canyon.width - 64, 123);
}


//check if character gets close to canyon
function checkCanyon(t_canyon) {
    //check if character is close to canyon from the right 
    if (dist(t_canyon.x_pos + 30, floorPos_y, gameChar_world_x, floorPos_y) < 5) {
        if (gameChar_y > floorPos_y) {
            isPlummeting = false;
        }

        if (gameChar_y == floorPos_y || gameChar_y > floorPos_y) // or statement to prevent left/right movement whilst plummeting
        {
            isPlummeting = true;
            isRight = false;
            isLeft = false;
            gameplaySound.stop(); //stops gameplay sound when plummeting
        }
    }

    //check if character is close to canyon from the left
    if (dist(t_canyon.x_pos - 30 + t_canyon.width, floorPos_y, gameChar_world_x, floorPos_y) < 5) {
        if (gameChar_y > floorPos_y) {
            isPlummeting = false;
        }
    }
}

//extra implementation: dead end to the left of the screen
function checkDeadEnd() {
    //check if char reaches dead end whilst on ground
    if (dist(deadEndWall.x_pos + deadEndWall.width + 5, floorPos_y, gameChar_world_x, floorPos_y) <= 2) {
        isDeadEnd = true;
    }

    //check if char reaches dead end whilst in air
    if (dist(deadEndWall.x_pos + deadEndWall.width, floorPos_y + deadEndWall.height, gameChar_world_x, floorPos_y + deadEndWall.height) <= 5) {
        isDeadEnd = true;
    }
    else {
        isDeadEnd = false; //reset once away from dead end. without this character becomes buggy
    }
}


//draw collectable - dice
function drawCollectable(t_collectable) {
    fill(255, 255, 255);
    rect(t_collectable.x_pos + 100, t_collectable.y_pos + 312, t_collectable.size - 80, t_collectable.size - 80, 3); fill(0, 0, 0);
    ellipse(t_collectable.x_pos + (55 + t_collectable.size / 2), t_collectable.y_pos + (267 + t_collectable.size / 2), t_collectable.size / 30, t_collectable.size / 30)
    ellipse(t_collectable.x_pos + (60 + t_collectable.size / 2), t_collectable.y_pos + (272 + t_collectable.size / 2), t_collectable.size / 30, t_collectable.size / 30);
    ellipse(t_collectable.x_pos + (65 + t_collectable.size / 2), t_collectable.y_pos + (277 + t_collectable.size / 2), t_collectable.size / 30, t_collectable.size / 30);
}

//for each collectable, check if the character is close to it
function checkCollectable(t_collectable) {
    if (dist(gameChar_world_x, gameChar_y, t_collectable.x_pos + 100, t_collectable.y_pos + 312) < 30) {
        collectableSound.play(); // play collectable sound if character came close
        t_collectable.isFound = true; //make collectable invisible once reached
        game_score += 1; //increase score by 1
    }
}

//render the flagpole / flagpole drawing
function renderFlagpole() {
    push();
    fill(255, 255, 0);
    noStroke();
    if (flagpole.isReached) {
        rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
    }
    else {
        rect(flagpole.x_pos, floorPos_y - 50, 50, 50);

    }
    strokeWeight(6);
    stroke(105);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
    pop();
}


//check if character reached the flagpole
function checkFlagpole() {
    var d = abs(gameChar_world_x - flagpole.x_pos);
    if (d < 15) {
        flagpole.isReached = true;
        gameplaySound.stop();//stop gameplay sound if the flagpole has been reached...
        winSound.play();//...play winning sound instead
        winSound.stop(5); //make sure winner sound doesn't loop and stops after 5 seconds
    }
}

//extra implementation: drawing the dead end wall
function drawDeadEndWall() {
    fill(0, 155, 0);
    noStroke();
    rect(deadEndWall.x_pos, deadEndWall.y_pos, deadEndWall.width, deadEndWall.height);
    fill(0, 155, 0);
    strokeWeight(0);
    textSize(39);
    textStyle(BOLD);
    text("DEAD END", deadEndWall.x_pos + deadEndWall.width / 2, deadEndWall.y_pos);

}

function startGame() {
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    gameChar_world_x = gameChar_x - scrollPos;
    game_score = 0;
    scrollPos = 0;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isDeadEnd = false;


    trees_x = [-5580, -5050, -4580, -4050, -3580, -3050, -2580, -2050, -1580, -1050, -580, 50, 580, 1050, 1580, 2050, 2580, 3050, 3580, 4050, 4580, 5050, 5580];


    clouds = [
        { x_pos: -5200, y_pos: 40, size: 80 },
        { x_pos: -4200, y_pos: -15, size: 130 },
        { x_pos: -3700, y_pos: 40, size: 80 },
        { x_pos: -3300, y_pos: -15, size: 130 },
        { x_pos: -2700, y_pos: 40, size: 80 },
        { x_pos: -2300, y_pos: 40, size: 80 },
        { x_pos: -1700, y_pos: 40, size: 80 },
        { x_pos: -1300, y_pos: -15, size: 130 },
        { x_pos: -190, y_pos: 40, size: 80 },
        { x_pos: -50, y_pos: -15, size: 100 },
        { x_pos: 190, y_pos: 40, size: 80 },
        { x_pos: 1300, y_pos: -15, size: 130 },
        { x_pos: 1700, y_pos: 40, size: 80 },
        { x_pos: 2300, y_pos: -15, size: 130 },
        { x_pos: 2700, y_pos: 40, size: 80 },
        { x_pos: 3300, y_pos: -15, size: 130 },
        { x_pos: 3700, y_pos: 40, size: 80 },
        { x_pos: 4200, y_pos: -15, size: 130 },
        { x_pos: 5200, y_pos: 40, size: 80 }
    ];




    platforms = [];
    //push more platforms into the array
    platforms.push(createPlatforms(-5600, floorPos_y - 130, 30));
    platforms.push(createPlatforms(-5500, floorPos_y - 210, 200));
    platforms.push(createPlatforms(-5500, floorPos_y - 110, 30));
    platforms.push(createPlatforms(-5400, floorPos_y - 90, 30));
    platforms.push(createPlatforms(-5300, floorPos_y - 70, 30));
    platforms.push(createPlatforms(-5100, floorPos_y - 150, 110));
    platforms.push(createPlatforms(-4800, floorPos_y - 120, 110));
    platforms.push(createPlatforms(-4600, floorPos_y - 90, 70));
    platforms.push(createPlatforms(-4400, floorPos_y - 80, 40));
    platforms.push(createPlatforms(-4200, floorPos_y - 100, 110));
    platforms.push(createPlatforms(-3200, floorPos_y - 200, 70));
    platforms.push(createPlatforms(-3400, floorPos_y - 120, 90));
    platforms.push(createPlatforms(-3200, floorPos_y - 100, 120));
    platforms.push(createPlatforms(-2500, floorPos_y - 100, 80));
    platforms.push(createPlatforms(-2300, floorPos_y - 70, 60));
    platforms.push(createPlatforms(-1700, floorPos_y - 90, 40));
    platforms.push(createPlatforms(-1700, floorPos_y - 90, 40));
    platforms.push(createPlatforms(-1300, floorPos_y - 90, 120));
    platforms.push(createPlatforms(-720, floorPos_y - 90, 150));
    platforms.push(createPlatforms(-520, floorPos_y - 130, 100));
    platforms.push(createPlatforms(-420, floorPos_y - 190, 50));
    platforms.push(createPlatforms(-390, floorPos_y - 250, 20));
    platforms.push(createPlatforms(-320, floorPos_y - 280, 150));
    platforms.push(createPlatforms(20, floorPos_y - 100, 150));
    platforms.push(createPlatforms(380, floorPos_y - 80, 100));
    platforms.push(createPlatforms(700, floorPos_y - 100, 200));
    platforms.push(createPlatforms(1700, floorPos_y - 100, 200));
    platforms.push(createPlatforms(2700, floorPos_y - 80, 100));
    platforms.push(createPlatforms(3200, floorPos_y - 100, 100));
    platforms.push(createPlatforms(3400, floorPos_y - 130, 100));
    platforms.push(createPlatforms(3800, floorPos_y - 90, 100));
    platforms.push(createPlatforms(4300, floorPos_y - 95, 100));
    platforms.push(createPlatforms(4600, floorPos_y - 110, 100));
    platforms.push(createPlatforms(4900, floorPos_y - 80, 100));
    platforms.push(createPlatforms(5100, floorPos_y - 90, 100));


    mountains = [
        { x_pos: -5100, width: 170 },
        { x_pos: -4100, width: 90 },
        { x_pos: -3100, width: 170 },
        { x_pos: -2100, width: 90 },
        { x_pos: -1100, width: 170 },
        { x_pos: -110, width: 90 },
        { x_pos: 1100, width: 170 },
        { x_pos: 2100, width: 90 },
        { x_pos: 3100, width: 170 },
        { x_pos: 4100, width: 90 },
        { x_pos: 5100, width: 170 }
    ];


    canyon = [
        { x_pos: -5620, height: floorPos_y - 288, width: 80 },
        { x_pos: -4820, height: floorPos_y - 288, width: 80 },
        { x_pos: -4020, height: floorPos_y - 288, width: 80 },
        { x_pos: -3220, height: floorPos_y - 288, width: 80 },
        { x_pos: -2420, height: floorPos_y - 288, width: 80 },
        { x_pos: -1620, height: floorPos_y - 288, width: 80 },
        { x_pos: -820, height: floorPos_y - 288, width: 80 },
        { x_pos: 110, height: floorPos_y - 288, width: 80 },
        { x_pos: 820, height: floorPos_y - 288, width: 80 },
        { x_pos: 1620, height: floorPos_y - 288, width: 80 },
        { x_pos: 2420, height: floorPos_y - 288, width: 80 },
        { x_pos: 3220, height: floorPos_y - 288, width: 80 },
        { x_pos: 4020, height: floorPos_y - 288, width: 80 },
        { x_pos: 4820, height: floorPos_y - 288, width: 80 },
        { x_pos: 5620, height: floorPos_y - 288, width: 80 }
    ];


    collectable = [
        { x_pos: -5600, y_pos: -140, size: 100, isFound: false },
        { x_pos: -5500, y_pos: -170, size: 100, isFound: false },
        { x_pos: -5400, y_pos: -140, size: 100, isFound: false },
        { x_pos: -5430, y_pos: 100, size: 100, isFound: false },
        { x_pos: -4830, y_pos: -40, size: 100, isFound: false },
        { x_pos: -4530, y_pos: 100, size: 100, isFound: false },
        { x_pos: -4430, y_pos: -40, size: 100, isFound: false },
        { x_pos: -4230, y_pos: -20, size: 100, isFound: false },
        { x_pos: -3630, y_pos: 100, size: 100, isFound: false },
        { x_pos: -3300, y_pos: -100, size: 100, isFound: false },
        { x_pos: -2730, y_pos: 100, size: 100, isFound: false },
        { x_pos: -2550, y_pos: -20, size: 100, isFound: false },
        { x_pos: -1830, y_pos: 100, size: 100, isFound: false },
        { x_pos: -1780, y_pos: -30, size: 100, isFound: false },
        { x_pos: -1300, y_pos: 15, size: 100, isFound: false },
        { x_pos: -930, y_pos: 100, size: 100, isFound: false },
        { x_pos: -400, y_pos: -170, size: 100, isFound: false },
        { x_pos: -370, y_pos: -170, size: 100, isFound: false },
        { x_pos: -340, y_pos: -170, size: 100, isFound: false },
        { x_pos: -310, y_pos: -170, size: 100, isFound: false },
        { x_pos: -60, y_pos: 8, size: 100, isFound: false },
        { x_pos: -30, y_pos: 100, size: 100, isFound: false },
        { x_pos: 0, y_pos: 8, size: 100, isFound: false },
        { x_pos: 40, y_pos: 8, size: 100, isFound: false },
        { x_pos: 340, y_pos: 30, size: 100, isFound: false },
        { x_pos: 200, y_pos: 100, size: 100, isFound: false },
        { x_pos: 300, y_pos: 100, size: 100, isFound: false },
        { x_pos: 600, y_pos: 70, size: 100, isFound: false },
        { x_pos: 700, y_pos: 100, size: 100, isFound: false },
        { x_pos: 830, y_pos: 20, size: 100, isFound: false },
        { x_pos: 870, y_pos: 70, size: 100, isFound: false },
        { x_pos: 930, y_pos: 100, size: 100, isFound: false },
        { x_pos: 1600, y_pos: -20, size: 100, isFound: false },
        { x_pos: 1650, y_pos: -20, size: 100, isFound: false },
        { x_pos: 1700, y_pos: -20, size: 100, isFound: false },
        { x_pos: 1750, y_pos: -20, size: 100, isFound: false },
        { x_pos: 1830, y_pos: 100, size: 100, isFound: false },
        { x_pos: 2630, y_pos: -20, size: 100, isFound: false },
        { x_pos: 2730, y_pos: 100, size: 100, isFound: false },
        { x_pos: 2550, y_pos: -40, size: 100, isFound: false },
        { x_pos: 3630, y_pos: 100, size: 100, isFound: false },
        { x_pos: 3700, y_pos: -40, size: 100, isFound: false },
        { x_pos: 4290, y_pos: -10, size: 100, isFound: false },
        { x_pos: 4530, y_pos: 100, size: 100, isFound: false },
        { x_pos: 4600, y_pos: 100, size: 100, isFound: false },
        { x_pos: 5370, y_pos: 100, size: 100, isFound: false },
        { x_pos: 5400, y_pos: 100, size: 100, isFound: false },
        { x_pos: 5430, y_pos: 100, size: 100, isFound: false }
    ];


    flagpole = { isReached: false, x_pos: 5750 };

    deadEndWall = { x_pos: -6100, y_pos: 250, width: 400, height: 200 };
}


