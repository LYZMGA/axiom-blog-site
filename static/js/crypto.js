/**
 * Zero-knowledge client-side crypto using the Web Crypto API.
 * Password → PBKDF2 (SHA-256) → AES-256-GCM key.
 * Nothing is sent to the server.
 */

'use strict';

const BlogCrypto = (() => {

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  async function deriveKey(password, saltB64, iterations, usages = ['decrypt']) {
    const enc = new TextEncoder();
    const raw = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    const salt = b64ToBytes(saltB64);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      raw,
      { name: 'AES-GCM', length: 256 },
      false,
      usages
    );
  }

  async function decrypt(key, ivB64, ciphertextB64) {
    const iv = b64ToBytes(ivB64);
    const ct = b64ToBytes(ciphertextB64);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(plain);
  }

  /**
   * Derive a key from password and verify it against the stored validator.
   * Returns the CryptoKey on success, throws on wrong password or error.
   */
  async function unlockWithPassword(password, cryptoConfig, usages = ['decrypt']) {
    // Always include 'decrypt' so we can validate against the stored validator blob.
    const finalUsages = usages.includes('decrypt') ? usages : ['decrypt', ...usages];
    const key = await deriveKey(password, cryptoConfig.salt, cryptoConfig.iterations, finalUsages);
    // AES-GCM auth tag will throw if key is wrong — used as password verification.
    await decrypt(key, cryptoConfig.validator.iv, cryptoConfig.validator.ciphertext);
    return key;
  }

  return { deriveKey, decrypt, unlockWithPassword };
})();
