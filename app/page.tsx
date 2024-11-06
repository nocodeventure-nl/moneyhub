import { JWKSGenerator } from '@/components/jwks-generator';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  return (
    <main className="min-h-screen py-8">
      <div className="container">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <JWKSGenerator />
      </div>
    </main>
  );
}