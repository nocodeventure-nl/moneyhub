export interface JWKS {
  keys: JWK[];
}

export interface JWK {
  kty: string;
  kid: string;
  n: string;
  e: string;
  alg: string;
  use: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  jwk: JWK;
}