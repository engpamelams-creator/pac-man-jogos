class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 4;
        this.nextDirection = 4;
        this.frameCount = 7;
        this.currentFrame = 1;
        this.animationDelay = 100; // in ms
        this.lastAnimationTime = Date.now();
    }

    moveProcess() {
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
        }
    }

    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    map[i][j] === 2 &&
                    this.getMapX() === j &&
                    this.getMapY() === i
                ) {
                    map[i][j] = 3;
                    return true; // Food eaten
                }
            }
        }
        return false; // No food eaten
    }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: // Right
                this.x -= this.speed;
                break;
            case DIRECTION_UP: // Up
                this.y += this.speed;
                break;
            case DIRECTION_LEFT: // Left
                this.x += this.speed;
                break;
            case DIRECTION_BOTTOM: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: // Right
                this.x += this.speed;
                break;
            case DIRECTION_UP: // Up
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT: // Left
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        // usar Math.floor para índices de mapa (mais claro e seguro)
        const left = Math.floor(this.x / oneBlockSize);
        const top = Math.floor(this.y / oneBlockSize);
        const right = Math.floor((this.x + this.width - 1) / oneBlockSize);
        const bottom = Math.floor((this.y + this.height - 1) / oneBlockSize);

        if (
            map[top][left] == 1 ||
            map[bottom][left] == 1 ||
            map[top][right] == 1 ||
            map[bottom][right] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getMapX() == this.getMapX() &&
                ghost.getMapY() == this.getMapY()
            ) {
                return true;
            }
        }
        return false;
    }

    changeDirectionIfPossible() {
        if (this.direction == this.nextDirection) return;
        let tempDirection = this.direction;
        this.direction = this.nextDirection;
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    getMapX() {
        // usar Math.floor (equivalente a parseInt para positivos)
        return Math.floor(this.x / oneBlockSize);
    }

    getMapY() {
        return Math.floor(this.y / oneBlockSize);
    }

    getMapXRightSide() {
        return Math.floor((this.x + this.width - 1) / oneBlockSize);
    }

    getMapYRightSide() {
        return Math.floor((this.y + this.height - 1) / oneBlockSize);
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        const now = Date.now();
        if (now - this.lastAnimationTime > this.animationDelay) {
            this.changeAnimation();
            this.lastAnimationTime = now;
        }

        canvasContext.save();
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        // mapeamento: direção 1 => 0°, 2 => 90°, 3 => 180°, 4 => 270°
        const angle = ((this.direction - 1) * 90 * Math.PI) / 180;
        canvasContext.rotate(angle);
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}