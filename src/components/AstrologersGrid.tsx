import React, { useState, useMemo } from 'react';
import { Astrologer } from '../types/astrotalk';
import { AstrologerCard } from './AstrologerCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface AstrologersGridProps {
  astrologers: Astrologer[];
  searchQuery: string;
  onInitiateChat: (astrologer: Astrologer) => void;
  onInitiateCall: (astrologer: Astrologer) => void;
}

export const AstrologersGrid: React.FC<AstrologersGridProps> = ({
  astrologers,
  searchQuery,
  onInitiateChat,
  onInitiateCall
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  const categories = [
    { id: 'all', label: 'All Astrologers' },
    { id: 'vedic', label: 'Vedic Jyotish' },
    { id: 'tarot', label: 'Tarot Readers' },
    { id: 'numerology', label: 'Numerology' },
    { id: 'lal_kitab', label: 'Lal Kitab' },
    { id: 'nadi', label: 'Nadi Astrology' },
    { id: 'marriage', label: 'Marriage & Love' },
    { id: 'career', label: 'Career & Wealth' },
  ];

  const filteredAndSorted = useMemo(() => {
    let result = [...astrologers];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.name.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.specialties.some(s => s.toLowerCase().includes(q)) ||
          a.languages.some(l => l.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      if (activeCategory === 'marriage') {
        result = result.filter(a => a.specialties.some(s => s.toLowerCase().includes('milan') || s.toLowerCase().includes('relationship') || s.toLowerCase().includes('love')));
      } else if (activeCategory === 'career') {
        result = result.filter(a => a.specialties.some(s => s.toLowerCase().includes('career') || s.toLowerCase().includes('prashna') || s.toLowerCase().includes('numerology')));
      } else {
        result = result.filter(a => a.personaType === activeCategory || a.specialties.some(s => s.toLowerCase().includes(activeCategory)));
      }
    }

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.ordersCount - a.ordersCount);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.pricePerMin - b.pricePerMin);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.pricePerMin - a.pricePerMin);
    }

    return result;
  }, [astrologers, searchQuery, activeCategory, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Talk to Astrologers Online</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {filteredAndSorted.length} Available
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect within 60 seconds with verified scholars in Vedic Jyotish, Tarot, and Numerology.
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-amber-400"
          >
            <option value="popular">Most Popular</option>
            <option value="experience">Experience: High to Low</option>
            <option value="rating">Rating: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Astrologers Grid */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSorted.map((astrologer) => (
            <AstrologerCard
              key={astrologer.id}
              astrologer={astrologer}
              onInitiateChat={onInitiateChat}
              onInitiateCall={onInitiateCall}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Astrologers Match Your Search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters to view other verified pandits.
          </p>
          <button
            onClick={() => { setActiveCategory('all'); }}
            className="text-xs font-bold text-amber-600 hover:underline pt-2 inline-block"
          >
            Clear Filters
          </button>
        </div>
      )}

    </section>
  );
};
