import React from 'react';
import { Phone, Heart, Compass, ScrollText, ArrowRight } from 'lucide-react';

interface QuickActionTilesProps {
  onSelectAction: (actionId: string) => void;
}

export const QuickActionTiles: React.FC<QuickActionTilesProps> = ({ onSelectAction }) => {
  const tiles = [
    {
      id: 'talk',
      title: 'Talk to Astrologer',
      subtitle: 'Direct audio call',
      icon: Phone,
      badge: '1st Min Free',
    },
    {
      id: 'love',
      title: 'Love & Marriage',
      subtitle: 'Relationship guidance',
      icon: Heart,
      badge: 'Trending',
    },
    {
      id: 'horoscope',
      title: 'Daily Horoscope',
      subtitle: 'Aaj ka Rashifal 2026',
      icon: Compass,
      badge: 'Daily',
    },
    {
      id: 'kundli',
      title: 'Free Kundli',
      subtitle: 'Birth chart & doshas',
      icon: ScrollText,
      badge: '100% Free',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onSelectAction(tile.id)}
              className="bg-white hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left group active:scale-[0.98] min-h-[84px]"
            >
              {/* Top on mobile / Left on desktop: Icon + Arrow on mobile */}
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-105 group-hover:bg-amber-100 transition-transform flex-shrink-0 shadow-2xs">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>

                {/* Desktop Text inline */}
                <div className="hidden sm:block min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-600 transition leading-tight">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    {tile.subtitle}
                  </p>
                </div>

                {/* Mobile Arrow right */}
                <div className="sm:hidden w-7 h-7 rounded-full bg-slate-50 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Mobile Text (Full width so zero clipping on 320px-390px phones) */}
              <div className="sm:hidden w-full">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-600 leading-tight">
                  {tile.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                  {tile.subtitle}
                </p>
              </div>

              {/* Desktop Right Arrow Icon */}
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-50 group-hover:bg-amber-500 group-hover:text-white items-center justify-center text-slate-400 transition-colors flex-shrink-0 shadow-2xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionTiles;
