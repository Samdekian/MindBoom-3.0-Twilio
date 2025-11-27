
/**
 * Utilities for implementing end-to-end encryption and secure connections
 */

/**
 * Generate a secure random key for encryption
 */
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  try {
    // Generate a random AES-GCM key
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    return key;
  } catch (error) {
    console.error("Error generating encryption key:", error);
    throw new Error("Failed to generate secure encryption key");
  }
};

/**
 * Encrypt data using AES-GCM
 */
export const encryptData = async (data: ArrayBuffer, key: CryptoKey): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> => {
  try {
    // Create a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      data
    );
    
    return { encryptedData, iv };
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypt data using AES-GCM
 */
export const decryptData = async (encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> => {
  try {
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      encryptedData
    );
    
    return decryptedData;
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Failed to decrypt data");
  }
};

/**
 * Export encryption key to JSON Web Key format for storage
 */
export const exportEncryptionKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  try {
    const exportedKey = await window.crypto.subtle.exportKey("jwk", key);
    return exportedKey;
  } catch (error) {
    console.error("Error exporting encryption key:", error);
    throw new Error("Failed to export encryption key");
  }
};

/**
 * Import encryption key from JSON Web Key format
 */
export const importEncryptionKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  try {
    const key = await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    return key;
  } catch (error) {
    console.error("Error importing encryption key:", error);
    throw new Error("Failed to import encryption key");
  }
};

/**
 * Create a secure communication channel with end-to-end encryption
 */
export const createSecureChannel = async () => {
  try {
    // Generate a new encryption key
    const encryptionKey = await generateEncryptionKey();
    
    // Export the key for storage
    const exportedKey = await exportEncryptionKey(encryptionKey);
    
    return {
      encryptionKey,
      exportedKey,
      
      // Methods for using the channel
      encrypt: async (data: ArrayBuffer) => {
        return encryptData(data, encryptionKey);
      },
      
      decrypt: async (encryptedData: ArrayBuffer, iv: Uint8Array) => {
        return decryptData(encryptedData, encryptionKey, iv);
      }
    };
  } catch (error) {
    console.error("Error creating secure channel:", error);
    throw new Error("Failed to create secure communication channel");
  }
};
