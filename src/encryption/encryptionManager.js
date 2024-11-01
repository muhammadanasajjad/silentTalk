/* global BigInt */
export function getHexFromBigInt(n) {
    return n.toString(16);
}

export function getBigIntFromHex(hex) {
    return BigInt("0x" + hex);
}

export function hexToUint8Array(hexString) {
    // hexString = hexString.padStart(
    //     2 ** Math.ceil(Math.log2(hexString.length)),
    //     "0"
    // );
    const byteArray = new Uint8Array(
        hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    return byteArray;
}

export function uint8ArrayToHex(uint8Array) {
    return Array.from(uint8Array, (byte) =>
        byte.toString(16).padStart(2, "0")
    ).join("");
}

export function getRandomBigInt(bits) {
    const bytes = Math.ceil(bits / 8);
    const randomBytes = new Uint8Array(bytes);
    window.crypto.getRandomValues(randomBytes);

    // Create a BigInt from the random bytes
    let randomBigInt = BigInt(0);
    for (let i = 0; i < randomBytes.length; i++) {
        randomBigInt = (randomBigInt << BigInt(8)) + BigInt(randomBytes[i]);
    }

    // Ensure it's the desired number of bits by masking extra bits
    randomBigInt = randomBigInt | (BigInt(1) << BigInt(bits - 1)); // Set the top bit to ensure it's n-bits
    randomBigInt = randomBigInt | BigInt(1); // Set the least significant bit to ensure it's odd

    return randomBigInt;
}

function modExp(base, exp, mod) {
    base = BigInt(typeof base == "string" ? "0x" + base : base); // Ensure base is a BigInt
    exp = BigInt(typeof exp == "string" ? "0x" + exp : exp); // Ensure exp is a BigInt
    mod = BigInt(typeof mod == "string" ? "0x" + mod : mod); // Ensure mod is a BigInt

    let result = 1n; // Start with BigInt 1
    base = base % mod; // Reduce base mod mod

    while (exp > 0n) {
        if (exp % 2n === 1n) {
            // If exp is odd
            result = (result * base) % mod;
        }
        exp = exp >> 1n; // Right shift exp by 1 (exp / 2)
        base = (base * base) % mod; // Square the base mod mod
    }

    return result;
}

export function getPublicKey(privateKey, generator, prime) {
    return modExp(generator, privateKey, prime);
}

export function getSharedKey(otherPublicKey, privateKey, prime) {
    return modExp(otherPublicKey, privateKey, prime);
}

// Import the hex key as a CryptoKey
async function importKey(hexKey) {
    const rawKey = hexToUint8Array(hexKey.padStart(64, "0")); // Convert hex to Uint8Array

    return crypto.subtle.importKey(
        "raw", // Key format
        rawKey, // Key data as Uint8Array
        "AES-GCM", // Algorithm name
        true, // Whether the key is extractable
        ["encrypt", "decrypt"] // Key usages
    );
}

export async function encryptMessage(message, sharedKey) {
    if (typeof sharedKey == "bigint") sharedKey = getHexFromBigInt(sharedKey);
    const key = await importKey(sharedKey); // Import the key
    const encoder = new TextEncoder();
    const data = encoder.encode(message); // Convert message to Uint8Array
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv, // Initialization vector
        },
        key, // Encryption key
        data // Data to encrypt
    );

    return {
        iv: iv,
        ciphertext: new Uint8Array(encryptedData), // Return encrypted data as Uint8Array
    };
}

// Decrypt a message using AES-GCM
export async function decryptMessage(ciphertext, iv, sharedKey) {
    if (typeof sharedKey == "bigint") sharedKey = getHexFromBigInt(sharedKey);
    // Import the hex key as a CryptoKey
    const key = await importKey(sharedKey);

    // Perform decryption
    const decryptedData = await crypto.subtle
        .decrypt(
            {
                name: "AES-GCM",
                iv: iv, // Use the same IV that was used for encryption
            },
            key, // Decryption key
            ciphertext // Encrypted data (as Uint8Array)
        )
        .catch((err) => {
            console.log(err);
        });

    // Decode the decrypted data back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
}
