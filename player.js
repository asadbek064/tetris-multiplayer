class Player {
    constructor(tetris) {
        // constant for drop intervals
        this.DROP_SLOW = 1000;
        this.DROP_FAST = 50;

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

    // Update the piece state based on elapsed time
    update(deltaTime) {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }
}