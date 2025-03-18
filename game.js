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


document.getElementById('join-button').addEventListener('click', () => {
    const sessionCode = document.getElementById('session-code').value.trim();
    if (sessionCode) {
        console.log('Attempting to join session:', sessionCode);
        // Add logic to connect to the game using the session code
        joinGame(sessionCode);
    } else {
        alert('Please enter a valid session code!');
    }
});

function joinGame(code) {
    // Logic to connect to the host using the session code
    console.log('Joining game with code:', code);
    // Example: Use PeerJS to connect to the host Peer ID
}

const playerList = document.getElementById('player-list');

// Example function to add a player
function addPlayer(playerName) {
    const listItem = document.createElement('li');
    listItem.textContent = playerName;
    playerList.appendChild(listItem);
}

// Example function to remove a player
function removePlayer(playerName) {
    const items = playerList.getElementsByTagName('li');
    for (let item of items) {
        if (item.textContent === playerName) {
            playerList.removeChild(item);
            break;
        }
    }
}

peer.on('connection', (conn) => {
    const playerName = conn.peer; // Use the peer ID as the player's name
    addPlayer(playerName);

    conn.on('close', () => {
        removePlayer(playerName);
    });
});
