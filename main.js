// Initialize an array to hold Tetris game instances
const tetri = [];

// Create a Tetris game instance for each player element and store it in the tetri array
const playerElements = document.querySelectorAll('.player');
playerElements.forEach(element => {
    const tetris = new Tetris(element);
    tetri.push(tetris);
});

// event listener function for handling key presses
const keyListener = (event) => {
    // Define key codes for player controls
    const keyBindings = [
        [65, 68, 81, 69, 83], // Player 1: A, D, Q, E, S
        [72, 75, 89, 73, 74], // Player 2: H, K, Y, I, J
    ];

    keyBindings.forEach((keyCodes, index) => {
        const player = tetri[index].player;

        if (event.type === 'keydown') {
            // Handle movement and rotation based on key presses
            if (event.keyCode === keyCodes[0]) {
                player.move(-1); // Move left
            } else if (event.keyCode === keyCodes[1]) {
                player.move(1); // Move right
            } else if (event.keyCode === keyCodes[2]) {
                player.rotate(-1); // Rotate left
            } else if (event.keyCode === keyCodes[3]) {
                player.rotate(1); // Rotate right
            }
        }

        // Handle fast drop based on key press/release
        if (event.keyCode === keyCodes[4]) {
            if (event.type === 'keydown') {
                if (player.dropInterval !== player.DROP_FAST) {
                    player.drop(); 
                    player.dropInterval = player.DROP_FAST; 
                }
            } else {
                player.dropInterval = player.DROP_SLOW; 
            }
        }
    });
};

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);
