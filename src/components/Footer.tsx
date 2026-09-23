import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-20 pb-16 border-t border-[#1E293B] font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Talk to astra.in banner */}
        <div className="p-8 sm:p-12 bg-[#1E293B] border border-[#334155] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Talk to astra.in.
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Looking at natal ephemeris precision, multi-tradition API integrations, or conversational AI intelligence? Talk to us about the data layer behind it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="mailto:contact@astra.in"
              className="px-6 py-3.5 bg-[#FF552E] hover:bg-[#E6441D] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg"
            >
              <span>TALK TO US</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-xs">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="grid grid-cols-2 gap-1 w-4 h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF552E]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                astra<span className="text-[#FF552E]">.in</span>
              </span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed max-w-sm">
              AI products for human self-discovery and timing intelligence. Ingesting raw planetary ephemeris, delivering actionable life workflows.
            </p>
            <div className="text-[11px] font-mono text-[#64748B]">
              Engineered in Bengaluru & London. Serving users across 140+ countries.
            </div>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-2 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Products</h4>
            <ul className="space-y-2 text-[#94A3B8]">
              <li><a href="#products" className="hover:text-[#FF552E] transition-colors">Palladium Ephemeris</a></li>
              <li><a href="#products" className="hover:text-[#FF552E] transition-colors">Astra AI Terminal</a></li>
              <li><a href="#chart" className="hover:text-[#FF552E] transition-colors">Natal Calculator</a></li>
              <li><a href="#synastry" className="hover:text-[#FF552E] transition-colors">Synastry Matrix</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-2 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-[#94A3B8]">
              <li><a href="#platform" className="hover:text-[#FF552E] transition-colors">Platform Architecture</a></li>
              <li><a href="#ethics" className="hover:text-[#FF552E] transition-colors">Ethics & Jung</a></li>
              <li><a href="#pricing" className="hover:text-[#FF552E] transition-colors">Pricing</a></li>
              <li><a href="#careers" className="hover:text-[#FF552E] transition-colors">Careers (We're Hiring)</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="md:col-span-3 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Office</h4>
            <p className="text-[#94A3B8] text-xs font-sans leading-relaxed">
              Product questions or tender integrations? Write to <a href="mailto:contact@astra.in" className="text-[#FF552E] underline">contact@astra.in</a>
            </p>
            <div className="text-[11px] text-[#64748B] pt-2">
              Calculation standard: NASA JPL Horizons & Swiss Ephemeris.
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#64748B]">
          <div>
            &copy; {new Date().getFullYear()} astra.in. All rights reserved. Bootstrapped, profitable & growing.
          </div>
          <div className="flex items-center gap-6">
            <a href="#ethics" className="hover:text-white">Privacy Policy</a>
            <a href="#ethics" className="hover:text-white">Terms of Service</a>
            <a href="#ethics" className="hover:text-white">Ethical Charter</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
