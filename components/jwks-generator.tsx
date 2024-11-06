"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, KeyRound, Loader2 } from 'lucide-react';
import * as jose from 'jose';

export function JWKSGenerator() {
  const [keyId, setKeyId] = useState('');
  const [keySize, setKeySize] = useState('2048');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{
    public: string;
    private: string;
  } | null>(null);

  const generateJWKS = async () => {
    if (!keyId.trim()) {
      toast.error('Please enter a Key ID');
      return;
    }

    setIsGenerating(true);
    try {
      const { publicKey, privateKey } = await jose.generateKeyPair('RS256', {
        extractable: true,
        modulusLength: parseInt(keySize),
      });

      const exportedPrivateJWK = await jose.exportJWK(privateKey);
      const exportedPublicJWK = await jose.exportJWK(publicKey);

      // Calculate thumbprint for the kid if not provided
      const thumbprint = await jose.calculateJwkThumbprint(exportedPublicJWK);
      const kid = keyId || thumbprint;

      // Create the public JWKS
      const publicJWKS = {
        keys: [{
          ...exportedPublicJWK,
          kid,
          use: 'sig',
          alg: 'RS256'
        }]
      };

      // Create the private JWKS
      const privateJWKS = {
        keys: [{
          ...exportedPrivateJWK,
          kid,
          use: 'sig',
          alg: 'RS256'
        }]
      };

      setGeneratedKeys({
        public: JSON.stringify(publicJWKS, null, 2),
        private: JSON.stringify(privateJWKS, null, 2)
      });

      toast.success('JWKS generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate JWKS');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadKeys = (type: 'public' | 'private') => {
    if (!generatedKeys) {
      toast.error('No JWKS generated yet');
      return;
    }

    const content = type === 'public' ? generatedKeys.public : generatedKeys.private;
    const filename = type === 'public' ? `jwks-${keyId}.json` : `private-jwks-${keyId}.json`;

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6" />
            Moneyhub JWKS Generator
          </CardTitle>
          <CardDescription>
            Generate a new JSON Web Key Set for your Moneyhub integration.
            The public JWKS can be used in the Moneyhub Admin portal, and the private JWKS for API client configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyId">Key ID (optional)</Label>
              <Input
                id="keyId"
                placeholder="Enter a unique key identifier"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keySize">Key Size</Label>
              <Select value={keySize} onValueChange={setKeySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2048">2048 bits (Standard)</SelectItem>
                  <SelectItem value="4096">4096 bits (Extra Security)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateJWKS}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate JWKS
          </Button>

          {generatedKeys && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Public JWKS (for Moneyhub Admin Portal)</Label>
                  <Button variant="outline" size="sm" onClick={() => downloadKeys('public')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{generatedKeys.public}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Private JWKS (for API Client Configuration)</Label>
                  <Button variant="outline" size="sm" onClick={() => downloadKeys('private')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{generatedKeys.private}</code>
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}