class Arena {
    constructor(width, height) {
        // initialize the matrix with given height and width
        this.matrix = Array.from({ length: height }, () => Array(width).fill(0));
    }

    // clean the arean
    clear() {
        this.matrix.forEach(row => row.fill(0));
    }

    // check if player's piece collides with the arena's occupied cells
    collide(player)
    {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (this.matrix[y + o.y] &&
                    this.matrix[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    //merge the player's piece into the arena's matrix
    merge(player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.matrix[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    // sweep the arena for complete row and calculate the score
    sweep() {
        let score = 0;
        let rowCount = 0;

        for (let  y = this.matrix.length - 1; y >= 0; --y) {
            if (this.matrix[y].every(value => value !== 0)) {
                // remove the fileld row and add a new empty row at the top
                this.matrix.splice(y, 1);
                this.matrix.unshift(Array(this.matrix[0].length).fill(0));
                
                // update score and row count
                ++rowCount;
                score += rowCount *10;

                // Recheck the row at index y
                y++;
            }
        }
        return score;
    }
}