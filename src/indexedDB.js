// src/indexedDB.js
import { openDB } from "idb";

const DB_NAME = "encryptionApp";
const STORE_NAME = "userStore";

async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

// Save both privateKey and username
export async function saveUserData(privateKey, username) {
    const db = await initDB();
    await db.put(STORE_NAME, privateKey, "privateKey");
    await db.put(STORE_NAME, username, "username");
}

// Retrieve both privateKey and username
export async function getUserData() {
    const db = await initDB();
    const privateKey = await db.get(STORE_NAME, "privateKey");
    const username = await db.get(STORE_NAME, "username");
    return { privateKey, username };
}

// Delete privateKey and username
export async function deleteUserData() {
    const db = await initDB();
    await db.delete(STORE_NAME, "privateKey");
    await db.delete(STORE_NAME, "username");
}
