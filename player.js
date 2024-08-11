class Player {
    constructor(tetris) {
        this.isCPU = false;

        // constant for drop intervals
        this.DROP_SLOW = 1000;
        this.DROP_FAST = 25;

        this.tetris = tetris // ref to the tetris game instance
        this.arena = tetris.arena // ref to the arena

        // initialize the counters
        this.dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        // initialize pos and matrix
        this.pos = { x: 0, y:0 }
        this.matrix = null;
        this.score = 0;
        
        // start with a new piece
        this.reset();
    }

    getGhostPosition() {
        // clone current pos
        const shadowPos = { ...this.pos }

        // move the pieces down until it collides
        while (!this.arena.collide({matrix: this.matrix, pos: shadowPos})) {
            shadowPos.y++;
        }

        // move it back up to last valid pos
        shadowPos.y--;

        return shadowPos
    }

    // simulate a drop at the current position and retrn the score
    simulateDrop() {
        const originalY = this.pos.y;

        // drop to botton
        while (!this.arena.collide(this)) {
            this.pos.y++;
        }
        // last move caused a collision move back a row
        this.pos.y--; 

        // merge the piece with the arena and evaluate the state
        this.arena.merge(this);
        const linesCleared = this.arena.sweep();
        const height = this.getPileHeight();

        // Undo the merge
        this.arena.clearPiece(this);

        this.pos.y = originalY; // Restore the original position

        // (more lines cleared and lower height is better)
        // return a heuristic score function
        return linesCleared * 100 - height;
    }

     // calc the height of the highest occupied row
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

    // perform the best move based on a simple heuristic
    performBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        const originalX = this.pos.x;
        const originalMatrix = this.matrix;

        // test all possible moves (rotations and translations)
        for (let rotation = 0; rotation < 4; rotation++) {
            for (let moveX = -this.arena.matrix[0].length / 2; moveX < this.arena.matrix[0].length; moveX++) {
                this.pos.x = moveX;

                // Skip invalid positions
                if (this.arena.collide(this)) {
                    continue;
                }

                const score = this.simulateDrop();

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { x: this.pos.x, rotation };
                }

                this.pos.x = originalX; // Restore position after testing
            }
            this.rotate(1); // Rotate piece
        }

        if (bestMove) {
            // Execute the best move
            this.matrix = originalMatrix;
            this.pos.x = bestMove.x;
            for (let i = 0; i < bestMove.rotation; i++) {
                this.rotate(1);
            }
            this.drop();
        } else {
            // If no valid move is found, just drop the piece
            this.drop();
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

    // drop the piece down by one row
    drop() {
        this.pos.y++;
        if (this.arena.collide(this)) {
            this.pos.y--;
            this.arena.merge(this);
            this.reset();
            this.score += this.arena.sweep();
            this.tetris.updateScore(this.score);
        }
        this.dropCounter = 0;
    }

    // move the piece left or right
    move(dir) {
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
        }
    }

    // reset the piece to the top of the arena
    reset()
    {
        const pieces = 'ILJOTSZ';
        this.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
                     (this.matrix[0].length / 2 | 0);
        if (this.arena.collide(this)) {
            this.arena.clear();
            this.score = 0;
            updateScore();
        }
    }


    // rotate the piece 
    rotate(dir) {
        const pos = this.pos.x;
        let offset =  1;
        this._rotateMatrix(this.matrix, dir);

        while(this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos; 
                return;
            }
        }
        
    }

    // rotate the matrix (piece ) 90deg
    _rotateMatrix(matrix, dir) {
        // Transpose the matrix
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y], 
                    matrix[y][x]
                ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
            }
        }

        // Reverse rows or columns based on direction
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
}
