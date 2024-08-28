class Player {
    constructor(tetris) {
        this.isCPU = false;

        this.DROP_SLOW = 1000;
        this.DROP_FAST = 25;

        this.tetris = tetris;
        this.arena = tetris.arena;

        this.dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        this.pos = { x: 0, y: 0 };
        this.matrix = null;
        this.nextMatrix = null;
        this.score = 0;

        this.reset();
    }

    reset() {
        const pieces = 'ILJOTSZ';
        this.matrix = this.nextMatrix || createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        this.nextMatrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);

        if (this.arena.collide(this)) {
            this.arena.clear();
            this.score = 0;
            this.tetris.updateScore(this.score);
        }
    }

    update(deltaTime) {
        if (this.isCPU) {
            this.performBestMove();
        } else {
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }
        }
    }

    drop() {
        this.pos.y++;
        if (this.arena.collide(this)) {
            this.pos.y--;
            this.arena.merge(this);
            this.score += this.arena.sweep();
            this.tetris.updateScore(this.score);
            this.reset();
        }
        this.dropCounter = 0;
    }

    move(dir) {
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
        }
    }

    rotate(dir) {
        const pos = this.pos.x;
        let offset = 1;
        this._rotateMatrix(this.matrix, dir);

        while (this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
    }

    _rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    performBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        const originalY = this.pos.y;
        const originalMatrix = this.matrix;

        const allRotations = [0, 1, 2, 3];
        const allPositions = [...Array(this.arena.matrix[0].length).keys()].map(i => i - this.matrix[0].length / 2 | 0);

        for (const rotation of allRotations) {
            for (const posX of allPositions) {
                this.pos.x = posX;
                this.pos.y = originalY;
                this.matrix = this._rotateClone(originalMatrix, rotation);

                if (this.arena.collide(this)) continue;

                const score = this.evaluatePosition();

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { x: posX, rotation };
                }
            }
        }

        if (bestMove) {
            this.matrix = this._rotateClone(originalMatrix, bestMove.rotation);
            this.pos.x = bestMove.x;
            this.drop();
        } else {
            this.drop();
        }
    }

    evaluatePosition() {
        // Simulate the current piece's drop
        const originalY = this.pos.y;
        while (!this.arena.collide(this)) {
            this.pos.y++;
        }
        this.pos.y--;

        // Merge and evaluate
        this.arena.merge(this);
        const linesCleared = this.arena.sweep();
        const height = this.getPileHeight();
        const holes = this.getHoles();
        const bumpiness = this.getBumpiness();

        const score = linesCleared * 1000 - height * 40 - holes * 100 - bumpiness * 20;

        // Undo the merge
        this.arena.clearPiece(this);
        this.pos.y = originalY;

        return score;
    }

    getPileHeight() {
        const rows = this.arena.matrix;
        for (let y = 0; y < rows.length; ++y) {
            for (let x = 0; x < rows[y].length; ++x) {
                if (rows[y][x] !== 0) {
                    return rows.length - y;
                }
            }
        }
        return 0;
    }

    getHoles() {
        const rows = this.arena.matrix;
        let holes = 0;
        for (let x = 0; x < rows[0].length; x++) {
            let blockFound = false;
            for (let y = 0; y < rows.length; y++) {
                if (rows[y][x] !== 0) {
                    blockFound = true;
                } else if (blockFound && rows[y][x] === 0) {
                    holes++;
                }
            }
        }
        return holes;
    }

    getBumpiness() {
        const rows = this.arena.matrix;
        let bumpiness = 0;
        let lastHeight = null;
        for (let x = 0; x < rows[0].length; x++) {
            let y = 0;
            while (y < rows.length && rows[y][x] === 0) {
                y++;
            }
            if (lastHeight !== null) {
                bumpiness += Math.abs(lastHeight - y);
            }
            lastHeight = y;
        }
        return bumpiness;
    }

    _rotateClone(matrix, times) {
        let clone = matrix.map(row => [...row]);
        for (let i = 0; i < times; i++) {
            clone = this._rotateMatrixCopy(clone, 1);
        }
        return clone;
    }

    _rotateMatrixCopy(matrix, dir) {
        const result = matrix.map(row => [...row]);
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [result[x][y], result[y][x]] = [result[y][x], result[x][y]];
            }
        }
        if (dir > 0) {
            result.forEach(row => row.reverse());
        } else {
            result.reverse();
        }
        return result;
    }
}
