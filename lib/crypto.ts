import { KeyPair, JWK } from './types';
import crypto from 'crypto';

export function generateKeyPair(keyId: string): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const jwk: JWK = {
    kty: 'RSA',
    kid: keyId,
    n: publicKeyToJWK(publicKey),
    e: 'AQAB',
    alg: 'RS256',
    use: 'sig',
  };

  return {
    publicKey,
    privateKey,
    jwk,
  };
}

function publicKeyToJWK(publicKey: string): string {
  const pubKeyBuffer = crypto.createPublicKey(publicKey).export({
    format: 'der',
    type: 'spki',
  });
  
  // Extract the modulus (n) from the DER-encoded public key
  const modulus = extractModulus(pubKeyBuffer);
  return base64UrlEncode(modulus);
}

function extractModulus(derBuffer: Buffer): Buffer {
  // Skip the SPKI header and get to the actual key bits
  // This is a simplified version - in production you'd want more robust parsing
  const offset = derBuffer.indexOf(Buffer.from([0x02, 0x82]));
  if (offset === -1) throw new Error('Invalid DER format');
  return derBuffer.slice(offset + 4, offset + 4 + 256); // 2048 bits = 256 bytes
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}