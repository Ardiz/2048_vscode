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
    let tileIdCounter = 0;
    let activeTiles = new Map(); // Track active tiles with their DOM elements
    
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
    
    // Helper function to get tile position in pixels
    function getTilePosition(x, y) {
        // Check if we're on a mobile screen
        const isMobile = window.innerWidth <= 520;
        
        if (isMobile) {
            const gap = 10;
            const cellSize = (280 - 3 * gap) / 4; // 62.5px actual cell size
            return {
                x: x * (cellSize + gap),
                y: y * (cellSize + gap)
            };
        } else {
            const gap = 15;
            const cellSize = (450 - 3 * gap) / 4; // 101.25px actual cell size
            return {
                x: x * (cellSize + gap),
                y: y * (cellSize + gap)
            };
        }
    }
    
    // Helper function to create a tile element
    function createTileElement(value, x, y) {
        const tile = document.createElement('div');
        const tileId = ++tileIdCounter;
        
        tile.classList.add('tile', `tile-${value}`);
        tile.textContent = value;
        tile.setAttribute('data-tile-id', tileId);
        
        const position = getTilePosition(x, y);
        tile.style.transform = `translate(${position.x}px, ${position.y}px)`;
        
        return { element: tile, id: tileId };
    }
    
    // Helper function to animate tile to new position
    function animateTileToPosition(tileElement, x, y) {
        const position = getTilePosition(x, y);
        tileElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
    
    // Initialize the game board
    function initializeGrid() {
        gridContainer.innerHTML = '';
        grid = [];
        activeTiles.clear();
        tileIdCounter = 0;
        
        // Create the grid cells
        for (let i = 0; i < CELL_COUNT; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gridContainer.appendChild(cell);
            grid.push({
                value: 0,
                element: cell,
                x: i % GRID_SIZE,
                y: Math.floor(i / GRID_SIZE),
                tileId: null
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
            const value = Math.random() < 0.9 ? 2 : 4;
            randomCell.value = value;
            
            // Create and display the tile
            const tileData = createTileElement(value, randomCell.x, randomCell.y);
            randomCell.tileId = tileData.id;
            activeTiles.set(tileData.id, tileData.element);
            
            // Add to grid container and animate appearance
            tileData.element.style.opacity = 0;
            tileData.element.style.transform += ' scale(0)';
            gridContainer.appendChild(tileData.element);
            
            // Animate the tile appearance
            setTimeout(() => {
                tileData.element.style.opacity = 1;
                tileData.element.style.transform = tileData.element.style.transform.replace(' scale(0)', ' scale(1)');
            }, 50);
        }
    }
    
    // Update tile visual properties (color, text) without affecting position
    function updateTileAppearance(tileElement, value) {
        tileElement.className = `tile tile-${value}`;
        tileElement.textContent = value;
    }
    
    // Remove a tile from the game
    function removeTile(tileId) {
        const tileElement = activeTiles.get(tileId);
        if (tileElement) {
            tileElement.remove();
            activeTiles.delete(tileId);
        }
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
        const animations = []; // Store animation promises
        const tilesToRemove = []; // Store tiles to remove after merging
        
        // Move each tile
        traversals.y.forEach(y => {
            traversals.x.forEach(x => {
                const cell = getCell(x, y);
                if (cell.value === 0) return;
                
                let newX = x;
                let newY = y;
                let nextX, nextY;
                let merged = false;
                
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
                        merged = true;
                        nextCell.merged = true;
                        nextCell.value *= 2;
                        cell.value = 0; // Clear source cell immediately during merge
                        updateScore(nextCell.value);
                        
                        // Check for win
                        if (nextCell.value === 2048) {
                            checkWin();
                        }
                        break;
                    } else {
                        break;
                    }
                } while (true);
                
                if (newX !== x || newY !== y) {
                    // Animate the tile movement
                    const tileElement = activeTiles.get(cell.tileId);
                    if (tileElement) {
                        animateTileToPosition(tileElement, newX, newY);
                        
                        if (merged) {
                            // Handle merge: remove the moving tile and update the target tile
                            const targetCell = getCell(newX, newY);
                            const targetTileElement = activeTiles.get(targetCell.tileId);
                            
                            if (targetTileElement) {
                                // Update target tile appearance
                                setTimeout(() => {
                                    updateTileAppearance(targetTileElement, targetCell.value);
                                    targetTileElement.style.transform += ' scale(1.1)';
                                    setTimeout(() => {
                                        targetTileElement.style.transform = targetTileElement.style.transform.replace(' scale(1.1)', '');
                                    }, 100);
                                }, 200);
                            }
                            
                            // Remove the moving tile after animation
                            setTimeout(() => {
                                removeTile(cell.tileId);
                            }, 200);
                            
                            tilesToRemove.push(cell.tileId);
                        } else {
                            // Update cell tracking for non-merge moves
                            const targetCell = getCell(newX, newY);
                            targetCell.value = cell.value;
                            targetCell.tileId = cell.tileId;
                        }
                        
                        // Clear the original cell
                        cell.value = 0;
                        cell.tileId = null;
                    }
                }
            });
        });
        
        // Reset merged flags
        grid.forEach(cell => {
            cell.merged = false;
        });
        
        if (moved) {
            // Add new tile after animation completes
            setTimeout(() => {
                addRandomTile();
                
                if (checkGameOver()) {
                    setGameOver();
                }
            }, 250);
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