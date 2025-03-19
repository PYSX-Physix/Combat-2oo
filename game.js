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
      // Fetch weapon data for inventory items
      player.inventory = await Promise.all(player.inventory.map(async itemRef => {
        const itemDoc = await getDoc(doc(db, itemRef));
        if (itemDoc.exists()) {
          return itemDoc.data();
        } else {
          console.error("Weapon data not found for reference:", itemRef);
          return null;
        }
      }));
      // Filter out any null values
      player.inventory = player.inventory.filter(item => item !== null);
      console.log("Player data loaded:", player);
    } else {
      console.log("No player data found. Creating new profile...");
      await setDoc(docRef, {
        ...player,
        // Store references to weapon documents
        inventory: player.inventory.map(item => item.path)
      });
    }
  }
  
  // Save Player Data
  async function savePlayerData(uid) {
    const docRef = doc(db, "players", uid);
    await setDoc(docRef, {
      ...player,
      // Store references to weapon documents
      inventory: player.inventory.map(item => item.path)
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
      return `<li>${item.name} (Damage: ${item.damage})</li>`;
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
  async function addItemToInventory(itemRef) {
    const itemDoc = await getDoc(doc(db, itemRef));
    if (itemDoc.exists()) {
      const item = itemDoc.data();
      player.inventory.push({ ...item, path: itemRef }); // Store as object with path
      console.log(`${item.name} added to inventory.`);
      if (auth.currentUser) {
        await savePlayerData(auth.currentUser.uid);
      } else {
        console.error("No user signed in. Cannot save player data.");
      }
      updateUI();
    } else {
      console.error("Weapon data not found for reference:", itemRef);
    }
  }

// Example weapon reference
const swordRef = "weapons/sword-default";
addItemToInventory(swordRef);
