let score = 0;
let currentLevel = 1;
let level2Eaten = 0;
let bonusActive = false;
let sharkActive = false;
let gameOver = false;
let bonusSpawned = false;
let mainCharacter;
let level1Fish = [];
let level2Fish = [];
let bonusFish;
let shark;

const images = {
    mainCharacter: null,
    level1Fish: null,
    level2Fish: null,
    deadFish: null,
    bonusFish: null,
    shark: null,
};

class GameObject {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.movementInterval = null;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.image == images.mainCharacter || this.image == images.shark) {
            this.x = Math.max(0, Math.min(this.x, 600 - this.width));
            this.y = Math.max(0, Math.min(this.y, 600 - this.height));
        }
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

const gameArea = {
    canvas: document.createElement("canvas"),
    start() {
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);

        window.addEventListener("keydown", (e) => {
            gameArea.keys = gameArea.keys || {};
            gameArea.keys[e.keyCode] = true;
        });
        window.addEventListener("keyup", (e) => {
            gameArea.keys[e.keyCode] = false;
        });
    },
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
};

function startGame() {
    loadImages(() => {
        gameArea.start();
        mainCharacter = new GameObject(images.mainCharacter, 300, 300, 80, 50);
        createLevel1Fish(5);
    });
}

function loadImages(callback) {
    let loaded = 0;
    const toLoad = Object.keys(images).length;

    for (const [name, src] of Object.entries({
        mainCharacter: "main_character.svg",
        level1Fish: "level1_fish.svg",
        level2Fish: "level2_fish.svg",
        deadFish: "dead.svg",
        bonusFish: "blowfish_bonus.svg",
        shark: "shark.svg",
    })) {
        images[name] = new Image();
        images[name].onload = () => {
            if (++loaded == toLoad) callback();
        };
        images[name].src = src;
    }
}

function createLevel1Fish(count) {
    for (let i = 0; i < count; i++) {
        const fish = new GameObject(
            images.level1Fish,
            Math.random() * 500 + 50,
            Math.random() * 500 + 50,
            60,
            30
        );
        addRandomMovement(fish, 3);
        level1Fish.push(fish);
    }
}

function createLevel2Fish(count) {
    for (let i = 0; i < count; i++) {
        const fish = new GameObject(
            images.level2Fish,
            Math.random() * 500 + 50,
            Math.random() * 500 + 50,
            120,
            90
        );
        addRandomMovement(fish, 4);
        level2Fish.push(fish);
    }
}

function createBonusFish() {
    bonusFish = new GameObject(
        images.bonusFish,
        Math.random() * 500 + 50,
        Math.random() * 500 + 50,
        80,
        50
    );
    addRandomMovement(bonusFish, 5);
    bonusActive = true;
    bonusSpawned = true;
}

function createShark() {
    shark = new GameObject(
        images.shark,
        Math.random() * 500 + 50,
        Math.random() * 500 + 50,
        200,
        150
    );
    addRandomMovement(shark, 6);
    sharkActive = true;
}

function addRandomMovement(obj, speed) {
    const updateMovement = () => {
        obj.speedX = (Math.random() - 0.5) * speed * (0.5 + Math.random());
        obj.speedY = (Math.random() - 0.5) * speed * (0.5 + Math.random());
    };

    if (obj.movementInterval) clearInterval(obj.movementInterval);
    updateMovement();
    obj.movementInterval = setInterval(
        updateMovement,
        800 + Math.random() * 800
    );
}

function checkCollision(mainC, enemy) {
    return (
        mainC.x < enemy.x + enemy.width &&
        mainC.x + mainC.width > enemy.x &&
        mainC.y < enemy.y + enemy.height &&
        mainC.y + mainC.height > enemy.y
    );
}

function checkAppearance(enemy) {
    return (
        enemy.x < -enemy.width ||
        enemy.x > 600 + enemy.width ||
        enemy.y < -enemy.height ||
        enemy.y > 600 + enemy.height
    );
}

function handleCollisions() {
    level1Fish = level1Fish.filter((fish) => {
        if (checkCollision(mainCharacter, fish)) {
            score++;
            sizeIncrease();
            return false;
        }
        return !checkAppearance(fish);
    });

    level2Fish = level2Fish.filter((fish) => {
        if (checkCollision(mainCharacter, fish)) {
            level2Eaten++;
            score++;
            sizeIncrease();
            if (level2Eaten >= 2 && !bonusSpawned) createBonusFish();
            return false;
        }
        return !checkAppearance(fish);
    });

    if (bonusActive) {
        if (checkCollision(mainCharacter, bonusFish)) {
            mainCharacter.width *= 1.2;
            mainCharacter.height *= 1.2;
            bonusActive = false;
        }
        if (checkAppearance(bonusFish)) bonusActive = false;
    }

    if (sharkActive && checkCollision(mainCharacter, shark)) {
        if (mainCharacter.height > shark.height || score == 10) {
            console.log("shark " + shark.height);
            console.log("player " + mainCharacter.height);
            document.getElementById("winText").style.display = "block";
        } else {
            document.getElementById("gameOverText").style.display = "block";

            mainCharacter.image = images.deadFish;
        }
        gameOver = true;
        sharkActive = false;
    }
}

function sizeIncrease() {
    const scale = score <= 5 ? 1.07 : 1.2;
    mainCharacter.width *= scale;
    mainCharacter.height *= scale;
}

function updateGameArea() {
    if (gameOver) return;

    gameArea.clear();
    gameArea.context.fillStyle = "white";
    gameArea.context.font = "20px Arial";
    gameArea.context.fillText("Score: " + score, 470, 30);

    handleCollisions();

    mainCharacter.speedX = 0;
    mainCharacter.speedY = 0;
    if (gameArea.keys) {
        if (gameArea.keys[37]) mainCharacter.speedX = -5;
        if (gameArea.keys[39]) mainCharacter.speedX = 5;
        if (gameArea.keys[38]) mainCharacter.speedY = -5;
        if (gameArea.keys[40]) mainCharacter.speedY = 5;
    }

    mainCharacter.update();
    level1Fish.forEach((fish) => fish.update());
    level2Fish.forEach((fish) => fish.update());
    if (bonusActive) bonusFish.update();
    if (sharkActive) shark.update();

    if (level1Fish.length == 0 && currentLevel == 1) {
        currentLevel = 2;
        createLevel2Fish(5);
    }

    if (
        currentLevel == 2 &&
        level2Fish.length == 0 &&
        !bonusActive &&
        !sharkActive
    ) {
        createShark();
    }

    mainCharacter.draw(gameArea.context);
    level1Fish.forEach((fish) => fish.draw(gameArea.context));
    level2Fish.forEach((fish) => fish.draw(gameArea.context));
    if (bonusActive) bonusFish.draw(gameArea.context);
    if (sharkActive) shark.draw(gameArea.context);
}

startGame();
