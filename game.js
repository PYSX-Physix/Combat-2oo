const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = {
    player1: { x: 50, y: 200, color: "red" },
    player2: { x: 700, y: 200, color: "blue" }
};

// Draw players
function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.values(players).forEach(player => {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, 50, 50);
    });
}

// Game loop
function gameLoop() {
    drawPlayers();
    requestAnimationFrame(gameLoop);
}
gameLoop();


const peer = new Peer();
peer.on('open', (id) => {
    console.log('Your Peer ID:', id);

    // Map session code to Peer ID
    const sessionMap = {};
    sessionMap[sessionCode] = id;
});


// Connect to another peer
const conn = peer.connect('another-peer-id');
conn.on('open', () => {
    conn.send('Hello Player 2!');
});

conn.on('data', (data) => {
    console.log('Received:', data);
});

function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Example usage
const sessionCode = generateCode();
console.log('Your session code:', sessionCode);


function joinGame(inputCode) {
    const hostPeerId = sessionMap[inputCode]; // Retrieve Peer ID from the code
    if (hostPeerId) {
        const conn = peer.connect(hostPeerId);
        conn.on('open', () => {
            console.log('Connected to host');
        });
    } else {
        alert('Invalid session code');
    }
}
