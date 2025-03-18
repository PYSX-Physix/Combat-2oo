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


const peer = new Peer(); // Create a new peer connection
peer.on('open', (id) => {
    console.log('My peer ID is:', id);
});

// Connect to another peer
const conn = peer.connect('another-peer-id');
conn.on('open', () => {
    conn.send('Hello Player 2!');
});

conn.on('data', (data) => {
    console.log('Received:', data);
});
