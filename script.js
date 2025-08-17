document.addEventListener("DOMContentLoaded", function() {
    // Game constants
    const GRID_SIZE = 4;
    const CELL_COUNT = GRID_SIZE * GRID_SIZE;
    
    // Game variables
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let gameWon = false;
    let continueAfterWin = false;
    
    // HTML elements
    const gridContainer = document.getElementById('grid-container');
    const scoreElement = document.getElementById('score');
    const bestElement = document.getElementById('best');
    const messageElement = document.getElementById('game-message');
    const newGameButton = document.getElementById('new-game');
    const retryButton = document.getElementById('retry');
    
    // Update the displayed score
    function updateScore(value) {
        score += value;
        scoreElement.textContent = score;
        
        if (score > bestScore) {
            bestScore = score;
            bestElement.textContent = bestScore;
            localStorage.setItem('bestScore', bestScore);
        }
    }
    
    // Initialize the game board
    function initializeGrid() {
        gridContainer.innerHTML = '';
        grid = [];
        
        // Create the grid cells
        for (let i = 0; i < CELL_COUNT; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gridContainer.appendChild(cell);
            grid.push({
                value: 0,
                element: cell,
                x: i % GRID_SIZE,
                y: Math.floor(i / GRID_SIZE)
            });
        }
        
        // Show the best score
        bestElement.textContent = bestScore;
    }
    
    // Get a specific cell from the grid
    function getCell(x, y) {
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            return grid[y * GRID_SIZE + x];
        }
        return null;
    }
    
    // Get available cells for new tile placement
    function getAvailableCells() {
        return grid.filter(cell => cell.value === 0);
    }
    
    // Add a new tile to the board
    function addRandomTile() {
        const availableCells = getAvailableCells();
        
        if (availableCells.length > 0) {
            // Select a random available cell
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            
            // 90% chance for a 2, 10% chance for a 4
            randomCell.value = Math.random() < 0.9 ? 2 : 4;
            
            // Create and display the tile
            const tile = document.createElement('div');
            tile.classList.add('tile', `tile-${randomCell.value}`);
            tile.textContent = randomCell.value;
            tile.style.opacity = 0;
            
            // Add the tile to the grid cell
            randomCell.element.appendChild(tile);
            
            // Animate the tile appearance
            setTimeout(() => {
                tile.style.opacity = 1;
            }, 50);
        }
    }
    
    // Update the visual representation of the tiles
    function updateTiles() {
        grid.forEach(cell => {
            cell.element.innerHTML = '';
            if (cell.value > 0) {
                const tile = document.createElement('div');
                tile.classList.add('tile', `tile-${cell.value}`);
                tile.textContent = cell.value;
                cell.element.appendChild(tile);
            }
        });
    }
    
    // Check if the game is over (no more moves possible)
    function checkGameOver() {
        // Check if there are any empty cells
        if (getAvailableCells().length > 0) {
            return false;
        }
        
        // Check if any adjacent cells have the same value
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const cell = getCell(x, y);
                
                // Check right and down neighbors
                const neighbors = [
                    getCell(x + 1, y),
                    getCell(x, y + 1)
                ];
                
                for (const neighbor of neighbors) {
                    if (neighbor && neighbor.value === cell.value) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // Game state functions
    function setGameOver() {
        gameOver = true;
        messageElement.classList.add('game-over');
        messageElement.querySelector('p').textContent = 'Game Over!';
    }
    
    function setGameWon() {
        if (!gameWon && !continueAfterWin) {
            gameWon = true;
            messageElement.classList.add('game-won');
            messageElement.querySelector('p').textContent = 'You Win!';
        }
    }
    
    // Check if player reached 2048 tile
    function checkWin() {
        for (const cell of grid) {
            if (cell.value === 2048 && !gameWon) {
                setGameWon();
                return true;
            }
        }
        return false;
    }
    
    // Move tiles in a specific direction
    function moveTiles(direction) {
        if (gameOver || (gameWon && !continueAfterWin)) {
            return false;
        }
        
        // Define the traversal order based on direction
        const vector = {
            'up': {x: 0, y: -1},
            'right': {x: 1, y: 0},
            'down': {x: 0, y: 1},
            'left': {x: -1, y: 0}
        }[direction];
        
        const traversals = {
            x: [],
            y: []
        };
        
        // Determine the traversal order
        for (let i = 0; i < GRID_SIZE; i++) {
            traversals.x.push(i);
            traversals.y.push(i);
        }
        
        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();
        
        let moved = false;
        
        // Move each tile
        traversals.y.forEach(y => {
            traversals.x.forEach(x => {
                const cell = getCell(x, y);
                if (cell.value === 0) return;
                
                let newX = x;
                let newY = y;
                let nextX, nextY;
                
                // Keep moving in the vector direction until we hit a boundary or another tile
                do {
                    nextX = newX + vector.x;
                    nextY = newY + vector.y;
                    const nextCell = getCell(nextX, nextY);
                    
                    if (!nextCell) break;
                    
                    if (nextCell.value === 0) {
                        // Move to an empty cell
                        newX = nextX;
                        newY = nextY;
                        moved = true;
                    } else if (nextCell.value === cell.value && !nextCell.merged) {
                        // Merge with a cell of the same value
                        newX = nextX;
                        newY = nextY;
                        moved = true;
                        nextCell.merged = true;
                        nextCell.value *= 2;
                        cell.value = 0;
                        updateScore(nextCell.value);
                        
                        // Check for win
                        if (nextCell.value === 2048) {
                            checkWin();
                        }
                    }
                } while (getCell(nextX, nextY) && getCell(nextX, nextY).value === 0);
                
                if (newX !== x || newY !== y) {
                    // Update the cell position
                    const targetCell = getCell(newX, newY);
                    if (cell.value !== 0 && targetCell.value === 0) {
                        targetCell.value = cell.value;
                        cell.value = 0;
                    }
                }
            });
        });
        
        // Reset merged flags
        grid.forEach(cell => {
            cell.merged = false;
        });
        
        if (moved) {
            addRandomTile();
            updateTiles();
            
            if (checkGameOver()) {
                setGameOver();
            }
        }
        
        return moved;
    }
    
    // Handle keyboard events
    function handleKeyDown(event) {
        const keyActions = {
            'ArrowUp': () => moveTiles('up'),
            'ArrowRight': () => moveTiles('right'),
            'ArrowDown': () => moveTiles('down'),
            'ArrowLeft': () => moveTiles('left'),
        };
        
        const action = keyActions[event.key];
        if (action) {
            event.preventDefault();
            action();
        }
    }
    
    // Start a new game
    function newGame() {
        score = 0;
        scoreElement.textContent = '0';
        gameOver = false;
        gameWon = false;
        continueAfterWin = false;
        messageElement.className = 'game-message';
        
        initializeGrid();
        addRandomTile();
        addRandomTile();
    }
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    newGameButton.addEventListener('click', newGame);
    retryButton.addEventListener('click', newGame);
    
    // Add touch controls for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    
    gridContainer.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        event.preventDefault();
    });
    
    gridContainer.addEventListener('touchmove', function(event) {
        event.preventDefault();
    });
    
    gridContainer.addEventListener('touchend', function(event) {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine the swipe direction
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 0) {
                    moveTiles('right');
                } else {
                    moveTiles('left');
                }
            } else {
                // Vertical swipe
                if (dy > 0) {
                    moveTiles('down');
                } else {
                    moveTiles('up');
                }
            }
        }
    });
    
    // Initialize the game
    initializeGrid();
    addRandomTile();
    addRandomTile();
});