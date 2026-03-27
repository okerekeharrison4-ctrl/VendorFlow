import { openDB } from 'idb';

const DB_NAME = 'VendorFlowDB';
const STORE_NAME = 'data';
const KEY_STORE = 'keys';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
    db.createObjectStore(KEY_STORE);
  },
});

async function getEncryptionKey() {
  const db = await dbPromise;
  let jwk = await db.get(KEY_STORE, 'encryption-key');
  if (!jwk) {
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    jwk = await window.crypto.subtle.exportKey('jwk', key);
    await db.put(KEY_STORE, jwk, 'encryption-key');
  }
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function saveEncryptedData(key: string, data: any) {
  try {
    const db = await dbPromise;
    const encryptionKey = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encodedData
    );
    await db.put(STORE_NAME, { encryptedData, iv }, key);
  } catch (error) {
    console.error(`Error saving encrypted data for key ${key}:`, error);
  }
}

export async function getEncryptedData(key: string) {
  try {
    const db = await dbPromise;
    const record = await db.get(STORE_NAME, key);
    if (!record) return null;
    const encryptionKey = await getEncryptionKey();
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv },
      encryptionKey,
      record.encryptedData
    );
    return JSON.parse(new TextDecoder().decode(decryptedData));
  } catch (error) {
    console.error(`Error decrypting data for key ${key}:`, error);
    return null;
  }
}
