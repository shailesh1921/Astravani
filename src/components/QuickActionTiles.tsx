import React from 'react';
import { Phone, Heart, Compass, ScrollText, ArrowRight } from 'lucide-react';

interface QuickActionTilesProps {
  onSelectAction: (actionId: string) => void;
}

export const QuickActionTiles: React.FC<QuickActionTilesProps> = ({ onSelectAction }) => {
  const tiles = [
    {
      id: 'talk',
      title: 'Talk',
      subtitle: 'Audio Consultation',
      icon: Phone,
      badge: '1st Min Free',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'love',
      title: 'Love',
      subtitle: 'Relationship & Marriage',
      icon: Heart,
      badge: 'Trending',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'horoscope',
      title: 'Horoscope',
      subtitle: 'Aaj Ka Rashifal 2026',
      icon: Compass,
      badge: 'Daily',
      iconBg: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'kundli',
      title: 'Kundli',
      subtitle: 'Free Janam Kundli',
      icon: ScrollText,
      badge: '100% Free',
      iconBg: 'bg-blue-100 text-blue-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              onClick={() => onSelectAction(tile.id)}
              className="bg-white hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Yellow/Amber Circular Icon Container (Astroyogi Style) */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-105 group-hover:bg-amber-100 transition-transform flex-shrink-0 shadow-2xs">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition truncate">
                      {tile.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
                    {tile.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Arrow Icon */}
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors flex-shrink-0 shadow-2xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
