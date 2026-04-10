import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'VendorFlowDB';
const STORE_NAME = 'data';
const KEY_STORE = 'keys';

let dbPromise: Promise<IDBPDatabase | null>;

try {
  dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
      db.createObjectStore(KEY_STORE);
    },
  }).catch(err => {
    console.warn('IndexedDB open failed, falling back to localStorage:', err);
    return null;
  });
} catch (err) {
  console.warn('IndexedDB not available, falling back to localStorage:', err);
  dbPromise = Promise.resolve(null);
}

let keyPromise: Promise<CryptoKey> | null = null;

async function getEncryptionKey(db: IDBPDatabase | null): Promise<CryptoKey> {
  if (keyPromise) {
    return keyPromise;
  }

  keyPromise = (async () => {
    let jwk: JsonWebKey | null = null;
    
    if (db) {
      try {
        jwk = await db.get(KEY_STORE, 'encryption-key');
      } catch (e) {
        console.warn('Failed to get key from IndexedDB', e);
      }
    } 
    
    if (!jwk) {
      const stored = localStorage.getItem('vendorflow-encryption-key');
      if (stored) {
        try {
          jwk = JSON.parse(stored);
        } catch (e) {}
      }
    }

    if (!jwk) {
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      jwk = await window.crypto.subtle.exportKey('jwk', key);
      
      if (db) {
        try {
          await db.put(KEY_STORE, jwk, 'encryption-key');
        } catch (e) {
          console.warn('Failed to save key to IndexedDB', e);
        }
      }
      localStorage.setItem('vendorflow-encryption-key', JSON.stringify(jwk));
    }
    
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  })();

  return keyPromise;
}

// Utility to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Utility to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function saveEncryptedData(key: string, data: any) {
  try {
    const db = await dbPromise;
    const encryptionKey = await getEncryptionKey(db);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encodedData
    );
    
    let savedToDb = false;
    if (db) {
      try {
        await db.put(STORE_NAME, { encryptedData, iv }, key);
        savedToDb = true;
      } catch (e) {
        console.warn('Failed to save to IndexedDB, falling back to localStorage', e);
      }
    } 
    
    if (!savedToDb) {
      const payload = {
        encryptedData: arrayBufferToBase64(encryptedData),
        iv: arrayBufferToBase64(iv.buffer)
      };
      localStorage.setItem(`vendorflow-data-${key}`, JSON.stringify(payload));
    }
  } catch (error) {
    console.error(`Error saving encrypted data for key ${key}:`, error);
  }
}

export async function getEncryptedData(key: string) {
  try {
    const db = await dbPromise;
    let encryptedData: ArrayBuffer | null = null;
    let iv: Uint8Array | null = null;
    
    if (db) {
      try {
        const record = await db.get(STORE_NAME, key);
        if (record) {
          encryptedData = record.encryptedData;
          iv = record.iv;
        }
      } catch (e) {
        console.warn('Failed to read from IndexedDB, falling back to localStorage', e);
      }
    } 
    
    if (!encryptedData || !iv) {
      const stored = localStorage.getItem(`vendorflow-data-${key}`);
      if (!stored) return null;
      const record = JSON.parse(stored);
      encryptedData = base64ToArrayBuffer(record.encryptedData);
      iv = new Uint8Array(base64ToArrayBuffer(record.iv));
    }
    
    const encryptionKey = await getEncryptionKey(db);
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encryptedData
    );
    return JSON.parse(new TextDecoder().decode(decryptedData));
  } catch (error) {
    console.error(`Error decrypting data for key ${key}:`, error);
    return null;
  }
}
