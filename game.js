// Module aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

// Game config
const CONFIG = {
    blockWidth: 40,
    blockHeight: 40,
    wallThickness: 200,
    spawnHeight: 100,
    fixedLetters: ["H", "E", "L", "L", "O"]
};

// Game state
let state = {
    score: 0,
    blockCount: 0,
    isGameOver: false,
    currentBlock: null,
    slideDirection: 1,
    slideSpeed: 3
};

// Setup Engine
// Chaotic Mode: Default iterations, no sleeping
const engine = Engine.create({
    enableSleeping: false
});
const world = engine.world;

// Renderer
const render = Render.create({
    element: document.getElementById('game-container'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#f0f0f0'
    }
});

// Resize handler
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    updateBoundaries();
});

// Letter definitions (5x5 grid, 1 = solid)
const LETTER_GRIDS = {
    'A': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
    'B': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
    'C': [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 1]],
    'D': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
    'E': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
    'F': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
    'G': [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    'H': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
    'I': [[0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 1, 1, 1, 0]],
    'J': [[0, 0, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [1, 0, 0, 1, 0], [0, 1, 1, 0, 0]],
    'K': [[1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 1, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
    'L': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
    'M': [[1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
    'N': [[1, 0, 0, 0, 1], [1, 1, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1]],
    'O': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    'P': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
    'Q': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [0, 1, 1, 0, 1]],
    'R': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
    'S': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    'T': [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    'U': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    'V': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0]],
    'W': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0]],
    'X': [[1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1]],
    'Y': [[1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    'Z': [[1, 1, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 1, 1, 1, 1]]
};

// Helper to get random letter
function getRandomLetter() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[Math.floor(Math.random() * letters.length)];
}

// Helper to get next block config
function getNextBlockConfig() {
    state.blockCount++;
    const isFixed = state.blockCount % 5 === 0;
    let letter;
    let color;

    if (isFixed) {
        const fixedIndex = (state.blockCount / 5) - 1;
        letter = CONFIG.fixedLetters[fixedIndex % CONFIG.fixedLetters.length];
        color = '#ff0000';
    } else {
        letter = getRandomLetter();
        color = '#000000';
    }

    return { letter, color };
}

// Create a composite body for a letter
function createLetterBody(x, y, letter, color) {
    const grid = LETTER_GRIDS[letter] || LETTER_GRIDS['A'];
    const parts = [];
    const cellSize = 10;
    const width = grid[0].length * cellSize;
    const height = grid.length * cellSize;

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === 1) {
                const partX = x + (c * cellSize) - (width / 2) + (cellSize / 2);
                const partY = y + (r * cellSize) - (height / 2) + (cellSize / 2);

                parts.push(Bodies.rectangle(partX, partY, cellSize, cellSize, {
                    render: { fillStyle: color }
                }));
            }
        }
    }

    // Chaotic Jitter Config
    const compoundBody = Matter.Body.create({
        parts: parts,
        restitution: 0.4,     // "Slight" bounce (inter-block collisions will bounce)
        friction: 0.1,        // Low friction
        frictionStatic: 0.1,
        frictionAir: 0.0,
        density: 0.01,
        label: 'block'
    });

    // We attach data to the composite itself (the parent)
    compoundBody.customData = { letter, color };

    return compoundBody;
}

// Spawn a new sliding block
function spawnSlidingBlock() {
    if (state.isGameOver) return;

    const { letter, color } = getNextBlockConfig();

    state.currentBlock = {
        x: window.innerWidth / 2,
        y: CONFIG.spawnHeight,
        angle: 0,
        letter: letter,
        color: color,
        width: 50,
        height: 50
    };
}

// Drop the current block
function dropBlock() {
    if (state.isGameOver || !state.currentBlock) return;

    const { x, y, angle, letter, color } = state.currentBlock;

    const body = createLetterBody(x, y, letter, color);
    Matter.Body.setAngle(body, angle);

    Composite.add(world, body);

    state.score++;
    document.getElementById('score-display').textContent = `Score: ${state.score}`;

    state.currentBlock = null;

    setTimeout(() => {
        spawnSlidingBlock();
    }, 1000);
}

// Update Boundaries - Modified Wide Bowl Shape
function updateBoundaries() {
    // Clear old ground/bowl parts
    const all = Composite.allBodies(world);
    const existingGrounds = all.filter(b => b.label === 'ground');
    Composite.remove(world, existingGrounds);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const centerX = width / 2;
    const bottomY = height - 50;
    const bowlWidth = width * 0.75;

    // Ends 50% shorter, Flat part long
    // New: Ends = (Bowl/3)*0.5 = Bowl/6.
    // Flat = Bowl - 2*(Bowl/6) = Bowl - Bowl/3 = 2/3 Bowl.

    const slopeWidth = bowlWidth / 6;
    const flatWidth = bowlWidth * (2 / 3);

    // 1. Wide Flat Bottom
    const bottom = Bodies.rectangle(centerX, bottomY, flatWidth, 20, {
        isStatic: true,
        label: 'ground',
        render: { fillStyle: '#333' },
        friction: 0.1,
        restitution: 0.5      // Moderate bounce
    });

    // 2. Short Left Slope (30 deg)
    const leftPos = centerX - (flatWidth / 2) - (slopeWidth / 2);
    // Calculated offset for slope centers
    const leftSlope = Bodies.rectangle(leftPos, bottomY - 15, slopeWidth * 1.2, 20, { // *1.2 for slight overlap
        isStatic: true,
        label: 'ground',
        angle: Math.PI / 6,
        render: { fillStyle: '#333' },
        friction: 0.1,
        restitution: 0.5
    });

    // 3. Short Right Slope (-30 deg)
    const rightPos = centerX + (flatWidth / 2) + (slopeWidth / 2);
    const rightSlope = Bodies.rectangle(rightPos, bottomY - 15, slopeWidth * 1.2, 20, {
        isStatic: true,
        label: 'ground',
        angle: -Math.PI / 6,
        render: { fillStyle: '#333' },
        friction: 0.1,
        restitution: 0.5
    });

    Composite.add(world, [bottom, leftSlope, rightSlope]);
}

// Input Handling
const gameContainer = document.getElementById('game-container');
gameContainer.addEventListener('mousedown', dropBlock);
gameContainer.addEventListener('touchstart', (e) => { e.preventDefault(); dropBlock(); }, { passive: false });

document.getElementById('rotate-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.currentBlock) {
        state.currentBlock.angle += Math.PI / 2;
    }
});

Events.on(engine, 'beforeUpdate', function (event) {
    if (state.isGameOver) return;

    if (state.currentBlock) {
        state.currentBlock.x += state.slideSpeed * state.slideDirection;
        const margin = 30;
        if (state.currentBlock.x > window.innerWidth - margin) state.slideDirection = -1;
        else if (state.currentBlock.x < margin) state.slideDirection = 1;
    }

    // Active Jitter Injection
    const allBodies = Composite.allBodies(world);
    for (let body of allBodies) {
        if (body.label === 'block') {
            // Apply tiny random force every frame
            const forceMag = 0.002 * body.mass;
            Matter.Body.applyForce(body, body.position, {
                x: (Math.random() - 0.5) * forceMag,
                y: (Math.random() - 0.5) * forceMag
            });
        }

        if (body.label === 'block' && body.position.y > window.innerHeight) {
            triggerGameOver();
        }
    }
});

// Rendering
Events.on(render, 'afterRender', function () {
    const context = render.context;

    if (state.currentBlock) {
        const { x, y, angle, letter, color } = state.currentBlock;
        const grid = LETTER_GRIDS[letter] || LETTER_GRIDS['A'];
        const cellSize = 10;
        const w = grid[0].length * cellSize;
        const h = grid.length * cellSize;

        context.save();
        context.translate(x, y);
        context.rotate(angle);

        context.fillStyle = color;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c] === 1) {
                    const py = (r * cellSize) - (h / 2);
                    const px = (c * cellSize) - (w / 2);
                    context.fillRect(px, py, cellSize, cellSize);
                }
            }
        }
        context.restore();
    }
});

function triggerGameOver() {
    if (state.isGameOver) return;
    state.isGameOver = true;
    document.getElementById('inputOverlay').classList.remove('hidden');
}

// Start
updateBoundaries();
spawnSlidingBlock();
Render.run(render);
Runner.run(Runner.create(), engine);

document.getElementById('restart-btn').addEventListener('click', () => location.reload());
document.getElementById('submitMsgBtn').addEventListener('click', () => location.reload());
console.log("Game initialized with WIDE BOWL and ACTIVE JITTER");
document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitMsgBtn");
    const input = document.getElementById("userMessage");
    const overlay = document.getElementById("inputOverlay");

    submitBtn.addEventListener("click", () => {
        const value = input.value.trim().toUpperCase();

        if (value === "HELLO") {
            overlay.innerHTML = `
                <div class="modal">
                    <h2>🎉 正解！</h2>
                    <p>あなたの言葉が塔を再建しました！</p>
                    <button class="btn" onclick="location.reload()">もう一度プレイ</button>
                </div>
            `;
        } else {
            alert("入力された文字は「HELLO」ではありません。");
        }
    });
});
