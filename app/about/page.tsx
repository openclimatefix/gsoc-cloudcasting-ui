// NEEDS A LOT OF DESIGN WORK

'use client';

import Header from '@/components/navbar';
import { withAuth } from '@/utils/withAuth';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto">
        {/* Hero section */}
        <div className="w-full py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">About CloudCasting</h1>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto text-center leading-relaxed">
              A world-first innovation that predicts cloud movements through satellite imagery,
              dramatically improving solar generation forecasts.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="max-w-5xl mx-auto px-6 py-12 grid gap-8">
          {/* Innovation */}
          <section className="bg-zinc-900 rounded-xl p-8 shadow-2xl border border-yellow-600/20 hover:border-yellow-500/30 transition-all">
            <div className="flex items-center mb-6">
              <div className="h-8 w-2 bg-yellow-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-yellow-400">Our Innovation</h2>
            </div>
            <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
              Our AI model analyzes multi-spectral satellite imagery to predict cloud movements up
              to 3 hours ahead, with updates every 15 minutes. This allows for unparalleled
              precision in short-term forecasting, helping grid operators, solar farms, and smart
              home owners optimize their energy usage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-800 p-6 rounded-lg border-l-4 border-yellow-500 hover:bg-zinc-800/80 transition-colors">
                <div className="text-yellow-400 font-bold mb-2 text-xl">3 Hours Ahead</div>
                <p className="text-zinc-300">
                  Predicts cloud movement patterns with unprecedented accuracy
                </p>
              </div>
              <div className="bg-zinc-800 p-6 rounded-lg border-l-4 border-yellow-500 hover:bg-zinc-800/80 transition-colors">
                <div className="text-yellow-400 font-bold mb-2 text-xl">15 Minute Updates</div>
                <p className="text-zinc-300">Regular updates for real-time decision making</p>
              </div>
              <div className="bg-zinc-800 p-6 rounded-lg border-l-4 border-yellow-500 hover:bg-zinc-800/80 transition-colors">
                <div className="text-yellow-400 font-bold mb-2 text-xl">Satellite Imagery</div>
                <p className="text-zinc-300">
                  Leverages multi-spectral satellite data for precision
                </p>
              </div>
            </div>
          </section>

          {/* Impact */}
          <section className="bg-zinc-900 rounded-xl p-8 shadow-2xl border border-yellow-600/20 hover:border-yellow-500/30 transition-all">
            <div className="flex items-center mb-6">
              <div className="h-8 w-2 bg-yellow-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-yellow-400">Real-World Impact</h2>
            </div>
            <p className="text-lg text-zinc-300 mb-4 leading-relaxed">
              CloudCasting improves solar forecast accuracy by up to 100% compared to traditional
              methods. This leads to reduced carbon emissions, lower energy costs, and a more
              reliable integration of renewable energy into power systems worldwide.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Built with cutting-edge technology, CloudCasting represents a transformative leap in
              solar energy forecasting and stands as a leading example of AI for environmental good.
            </p>
          </section>

          {/* Learn more */}
          <section className="bg-zinc-900 rounded-xl p-8 shadow-2xl border border-yellow-600/20 hover:border-yellow-500/30 transition-all">
            <div className="flex items-center mb-6">
              <div className="h-8 w-2 bg-yellow-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-yellow-400">Learn More</h2>
            </div>
            <p className="text-lg text-zinc-300 mt-4 leading-relaxed">
              Read more about CloudCasting on the Open Climate Fix blog:{' '}
              <a
                href="https://openclimatefix.org/post/meet-cloudcasting-our-newest-forecasting-innovation"
                className="text-yellow-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meet CloudCasting: Our Newest Forecasting Innovation
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AboutPage);
