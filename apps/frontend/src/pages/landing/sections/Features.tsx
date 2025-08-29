import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LayoutDashboard, BellRing, ShieldCheck, PlugZap } from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Cross-DAO Tracking',
    description: 'Unified view of proposals from sources like Tally.xyz.',
  },
  {
    icon: BellRing,
    title: 'Real-Time Notices',
    description: 'Push updates to Discord and Telegram subscribers.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliable by Design',
    description: 'Caching, rate-limits, and error recovery baked in.',
  },
  {
    icon: PlugZap,
    title: 'Modular & Extensible',
    description: 'Plug in more governance platforms over time.',
  },
];

export function Features() {
  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Built for Modern DAOs
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Everything you need to stay on top of governance across multiple
          platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-lg text-gray-100">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

