class Tetris {
    constructor(element, isCPU = false) {
        this.element = element; 
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20); // Scale the drawing context for rendering

        this.arena = new Arena(12, 20); // Initialize the game arena
        this.player = new Player(this); // Initialize the player
        this.player.isCPU = isCPU;
        this.updateInterval = 1000 / 1000
        this.lastTime = 0;

        // Define colors for the different Tetris pieces
        this.colors = [
            null,           // Index 0 is unused
            '#FF0D72',      // I piece
            '#0DC2FF',      // J piece
            '#0DFF72',      // L piece
            '#F538FF',      // O piece
            '#FF8E0D',      // S piece
            '#FFE138',      // T piece
            '#3877FF',      // Z piece
        ];

        this.startGameLoop();
        this.updateScore(0); 
    }

    startGameLoop() {
        const update = (time = 0) => {
            const deltaTime = time - this.lastTime;

            if(deltaTime >= this.updateInterval) {
                this.lastTime = time;
                
                this.player.update(deltaTime)
                
                this.draw()
            }

            requestAnimationFrame(update)
        };

        update()
    }

    // Draw the entire game state on the canvas
    draw() {
        this.context.fillStyle = '#000'; 
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // draw the ghost piece first 
        //const ghostPos = this.player.getGhostPosition();
        //this.drawMatrix(this.player.matrix, ghostPos, true)

        // draw the areand and the actual piece
        this.drawMatrix(this.arena.matrix, { x: 0, y: 0 }); 
        this.drawMatrix(this.player.matrix, this.player.pos); 
        
    }

    // Draw a matrix (arena or piece) at a specific offset
    drawMatrix(matrix, offset, isGhost = false) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = isGhost ? 'rgba(255,255,255, 0.5)' : this.colors[value]; 
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1); 
                }
            });
        });
    }

    // Update the score display on the page
    updateScore(score) {
        console.log(score);
        
        document.getElementById('cpu_score_1').innerText = score;
    }
}
