import { Badge } from '@/components/ui/badge';

const steps = [
  {
    number: 1,
    title: 'Connect sources',
    description: 'Add governance IDs and scrape fresh proposals.',
  },
  {
    number: 2,
    title: 'Review & subscribe',
    description: 'Search, filter, and set channel notifications.',
  },
  {
    number: 3,
    title: 'Stay informed',
    description: 'Your community gets timely, structured updates.',
  },
];

export function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Get started in three simple steps.
        </p>
      </div>

      <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Desktop connector line */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-600/50 to-transparent z-0" />
            )}

            <div className="relative z-10 text-center md:text-left">
              {/* Step number badge */}
              <div className="flex justify-center md:justify-start mb-6">
                <Badge className="w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center">
                  {step.number}
                </Badge>
              </div>

              {/* Step content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-100">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
