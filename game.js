import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
  
const firebaseConfig = {
    apiKey: "AIzaSyChIO5CyxhiZiU0t6vtqndi6lKsWnoja8E",
    authDomain: "combat-2pm.firebaseapp.com",
    databaseURL: "https://combat-2pm-default-rtdb.firebaseio.com",
    projectId: "combat-2pm",
    storageBucket: "combat-2pm.firebasestorage.app",
    messagingSenderId: "922835238590",
    appId: "1:922835238590:web:4dee5fef15d0b16d0be8ef",
    measurementId: "G-QVB6Z4DH80"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
  
  
  
// DOM Elements
const authContainer = document.getElementById("authContainer");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const ui = document.getElementById("ui");
const playerStats = document.getElementById("playerStats");
const inventoryList = document.getElementById("inventoryList");
  

  
  let player = {
    active_character: "player-default",
    health: 100,
    attack: 10,
    defense: 5,
    level: 1,
    experience: 0,
    inventory: []
  };
  
  // Authentication
  signInButton.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("Signed in!");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  });
  
  signOutButton.addEventListener("click", async () => {
    try {
      await auth.signOut();
      console.log("Signed out!");
      ui.style.display = "none";
      authContainer.style.display = "block";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  });
  
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("User signed in:", user.displayName);
      authContainer.style.display = "none";
      signOutButton.style.display = "block";
      ui.style.display = "block";
  
      // Load player data
      await loadPlayerData(user.uid);
      updateUI();
    } else {
      console.log("No user signed in.");
      signOutButton.style.display = "none";
      ui.style.display = "none";
      authContainer.style.display = "block";
    }
  });
  
  // Load Player Data
  async function loadPlayerData(uid) {
    const docRef = doc(db, "players", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      player = { ...player, ...data };
      // Deserialize inventory items
      player.inventory = player.inventory.map(item => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch (e) {
            console.error("Error parsing inventory item:", item, e);
            return item;
          }
        }
        return item;
      });
      console.log("Player data loaded:", player);
    } else {
      console.log("No player data found. Creating new profile...");
      await setDoc(docRef, {
        ...player,
        // Serialize inventory items
        inventory: player.inventory.map(item => JSON.stringify(item))
      });
    }
  }
  
  // Save Player Data
  async function savePlayerData(uid) {
    const docRef = doc(db, "players", uid);
    await setDoc(docRef, {
      ...player,
      // Serialize inventory items
      inventory: player.inventory.map(item => JSON.stringify(item))
    });
  }
  
  // Update UI
  function updateUI() {
    playerStats.innerHTML = `
      Level: ${player.level}<br>
      Experience: ${player.experience}<br>
      Health: ${player.health}<br>
      Attack: ${player.attack}<br>
      Defense: ${player.defense}
    `;
    inventoryList.innerHTML = player.inventory.map(item => {
      const weapon = item; // No need to parse again, already deserialized
      return `<li>${weapon.name} (Damage: ${weapon.damage})</li>`;
    }).join("");
  }
  
  // Combat
  function attackEnemy() {
    const enemy = { health: 50, attack: 8 };
    let damage = Math.max(0, player.attack - enemy.attack);
    enemy.health -= damage;
  
    console.log(`You dealt ${damage} damage. Enemy health: ${enemy.health}`);
    if (enemy.health <= 0) {
      console.log("Enemy defeated!");
      gainExperience(50);
    } else {
      enemyAttack(enemy);
    }
  }
  
  function enemyAttack(enemy) {
    let damage = Math.max(0, enemy.attack - player.defense);
    player.health -= damage;
  
    console.log(`Enemy dealt ${damage} damage. Your health: ${player.health}`);
    if (player.health <= 0) {
      console.log("You were defeated...");
    }
  
    updateUI();
  }
  
  // Experience and Leveling
  function gainExperience(xp) {
    player.experience += xp;
    if (player.experience >= 100) {
      player.experience -= 100;
      player.level++;
      player.attack += 5;
      player.defense += 3;
      player.health += 20;
      console.log(`Level up! New level: ${player.level}`);
    }
    savePlayerData(auth.currentUser.uid);
    updateUI();
  }
  
  // Inventory
  function addItemToInventory(item) {
    player.inventory.push(item); // Store as object
    console.log(`${item.name} added to inventory.`);
    savePlayerData(auth.currentUser.uid);
    updateUI();
  }

// Example weapon object
const sword = { name: "Sword", damage: 15 };
addItemToInventory(sword);
