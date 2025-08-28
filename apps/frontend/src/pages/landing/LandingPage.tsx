import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Footer } from './sections/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Demo mode banner */}
      {import.meta.env.VITE_MOCK === '1' && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 px-4 py-2 text-center text-sm text-blue-300">
          Demo mode
        </div>
      )}

      <main className="space-y-24">
        <Hero />
        <Features />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
