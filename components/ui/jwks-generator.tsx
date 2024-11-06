'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { generateKeyPair } from '@/lib/crypto';
import { JWKS } from '@/lib/types';

export function JWKSGenerator() {
  const [keyId, setKeyId] = useState('');
  const [jwks, setJwks] = useState<JWKS | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    try {
      if (!keyId.trim()) {
        setError('Please enter a Key ID');
        return;
      }

      const keyPair = generateKeyPair(keyId);
      setJwks({ keys: [keyPair.jwk] });
      setPrivateKey(keyPair.privateKey);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
            <KeyRound className="h-8 w-8" />
            JWKS Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate JWKS (JSON Web Key Set) for Moneyhub integration
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="keyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Key ID
              </label>
              <Input
                id="keyId"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="Enter your key ID (e.g., your-company-mh-2024)"
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              onClick={handleGenerate}
              className="w-full"
              disabled={!keyId.trim()}
            >
              Generate JWKS
            </Button>
          </div>
        </Card>

        {jwks && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">JWKS (Public Keys)</h2>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                {JSON.stringify(jwks, null, 2)}
              </pre>
              <Button
                onClick={() => handleDownload(JSON.stringify(jwks, null, 2), 'jwks.json')}
                className="mt-4"
                variant="outline"
              >
                Download JWKS
              </Button>
            </Card>

            {privateKey && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Private Key</h2>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                  {privateKey}
                </pre>
                <Button
                  onClick={() => handleDownload(privateKey, 'private-key.pem')}
                  className="mt-4"
                  variant="outline"
                >
                  Download Private Key
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}