import React, { useState, useMemo } from 'react';
import { Astrologer } from '../types/astrotalk';
import { AstrologerCard } from './AstrologerCard';
import { SlidersHorizontal, Sparkles, Filter, X, CheckCircle2, UserCheck, Clock, Languages, IndianRupee, Star, Zap } from 'lucide-react';
import { analytics } from '../services/analytics';

interface AstrologersGridProps {
  astrologers: Astrologer[];
  searchQuery: string;
  onInitiateChat: (astrologer: Astrologer) => void;
  onInitiateCall: (astrologer: Astrologer) => void;
  userTool?: 'kundli' | 'matching' | 'horoscope' | 'blog' | 'dosh';
  userDosh?: string;
  /** Growth experiment: initial sort mode. */
  initialSort?: string;
}

export const AstrologersGrid: React.FC<AstrologersGridProps> = ({
  astrologers,
  searchQuery,
  onInitiateChat,
  onInitiateCall,
  userTool,
  userDosh,
  initialSort = 'popular'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    astrologers.forEach(a => a.languages.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, [astrologers]);

  const categories = [
    { id: 'all', label: 'सभी (All)', icon: '🌟' },
    { id: 'vedic', label: 'वैदिक (Vedic)', icon: '🕉️' },
    { id: 'tarot', label: 'टैरो (Tarot)', icon: '🔮' },
    { id: 'numerology', label: 'अंक ज्योतिष (Numerology)', icon: '🔢' },
    { id: 'lal_kitab', label: 'लाल किताब (Lal Kitab)', icon: '📖' },
    { id: 'nadi', label: 'नाड़ी (Nadi)', icon: '📜' },
    { id: 'marriage', label: 'विवाह (Marriage)', icon: '💍' },
    { id: 'career', label: 'करियर (Career)', icon: '💼' },
  ];

  // Compute smart match tags for each astrologer
  const getSmartMatchTags = (astrologer: Astrologer): string[] => {
    const tags: string[] = [];
    const specialties = astrologer.specialties.map(s => s.toLowerCase()).join(' ');
    
    if (specialties.includes('sade sati') || specialties.includes('shani')) tags.push('Best for Shani Sade Sati');
    if (specialties.includes('manglik') || specialties.includes('mangal')) tags.push('Best for Manglik Dosha');
    if (specialties.includes('kaal sarp')) tags.push('Best for Kaal Sarp');
    if (specialties.includes('marriage') || specialties.includes('milan') || specialties.includes('love') || specialties.includes('relationship')) tags.push('Best for Marriage');
    if (specialties.includes('career') || specialties.includes('job') || specialties.includes('business') || specialties.includes('wealth') || specialties.includes('money')) tags.push('Best for Career');
    if (specialties.includes('health') || specialties.includes('vitality')) tags.push('Best for Health');
    if (specialties.includes('vastu')) tags.push('Best for Vastu');
    if (specialties.includes('rahu') || specialties.includes('ketu')) tags.push('Best for Rahu/Ketu');
    
    return tags.slice(0, 2);
  };

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
        result = result.filter(a => a.specialties.some(s => {
          const l = s.toLowerCase();
          return l.includes('milan') || l.includes('relationship') || l.includes('love') || l.includes('marriage');
        }));
      } else if (activeCategory === 'career') {
        result = result.filter(a => a.specialties.some(s => {
          const l = s.toLowerCase();
          return l.includes('career') || l.includes('prashna') || l.includes('wealth') || l.includes('job') || l.includes('business') || l.includes('money');
        }));
      } else if (activeCategory === 'lal_kitab') {
        result = result.filter(a => a.personaType === 'lal_kitab' || a.specialties.some(s => s.toLowerCase().includes('lal kitab')));
      } else {
        result = result.filter(a => a.personaType === activeCategory || a.specialties.some(s => s.toLowerCase().includes(activeCategory)));
      }
    }

    // Filter by price range
    result = result.filter(a => a.pricePerMin >= priceRange[0] && a.pricePerMin <= priceRange[1]);

    // Filter by languages
    if (selectedLanguages.length > 0) {
      result = result.filter(a => selectedLanguages.some(l => a.languages.includes(l)));
    }

    // Filter verified only
    if (verifiedOnly) {
      result = result.filter(a => a.isVerified);
    }

    // Filter online only
    if (onlineOnly) {
      result = result.filter(a => a.isOnline);
    }

    // Smart match boost: if user came from a tool, boost relevant specialists
    if (userTool || userDosh) {
      result.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        const aSpecs = a.specialties.map(s => s.toLowerCase()).join(' ');
        const bSpecs = b.specialties.map(s => s.toLowerCase()).join(' ');
        
        if (userDosh) {
          const dosh = userDosh.toLowerCase();
          if (aSpecs.includes(dosh)) scoreA += 10;
          if (bSpecs.includes(dosh)) scoreB += 10;
        }
        if (userTool === 'kundli' && (aSpecs.includes('mahadasha') || aSpecs.includes('dasha'))) scoreA += 5;
        if (userTool === 'matching' && (aSpecs.includes('milan') || aSpecs.includes('marriage'))) scoreA += 5;
        if (userTool === 'horoscope' && (aSpecs.includes('career') || aSpecs.includes('transit'))) scoreA += 5;
        
        return scoreB - scoreA;
      });
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
    } else if (sortBy === 'smart') {
      // Already sorted above
    }

    return result;
  }, [astrologers, searchQuery, activeCategory, sortBy, priceRange, selectedLanguages, verifiedOnly, onlineOnly, userTool, userDosh]);

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 100 || selectedLanguages.length > 0 || verifiedOnly || onlineOnly;

  const handleInitiateChat = (astrologer: Astrologer) => {
    analytics.trackEvent('astrologer_chat_initiated', {
      astrologer_id: astrologer.id,
      source: 'astrologers_grid',
      category: activeCategory,
    });
    onInitiateChat(astrologer);
  };

  const handleInitiateCall = (astrologer: Astrologer) => {
    analytics.trackEvent('astrologer_call_initiated', {
      astrologer_id: astrologer.id,
      source: 'astrologers_grid',
      category: activeCategory,
    });
    onInitiateCall(astrologer);
  };

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

        {/* Filter & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">
                {(selectedLanguages.length + (verifiedOnly?1:0) + (onlineOnly?1:0) + (priceRange[0]>0||priceRange[1]<100?1:0))}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-amber-400"
            >
              <option value="smart">Smart Match</option>
              <option value="popular">Most Popular</option>
              <option value="experience">Experience: High to Low</option>
              <option value="rating">Rating: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Filters</h3>
            <button
              onClick={() => {
                setPriceRange([0, 100]);
                setSelectedLanguages([]);
                setVerifiedOnly(false);
                setOnlineOnly(false);
              }}
              className="text-xs text-amber-600 hover:underline"
            >
              <X className="w-3 h-3 inline mr-1" /> Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">Price Range (₹/min)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1 h-2 bg-amber-500 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1 h-2 bg-amber-500 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Languages</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {allLanguages.map(lang => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang)}
                      onChange={(e) => e.target.checked 
                        ? setSelectedLanguages([...selectedLanguages, lang])
                        : setSelectedLanguages(selectedLanguages.filter(l => l !== lang))}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs text-slate-700">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Toggles */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Quick Filters</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-slate-700">Verified Only</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlineOnly}
                    onChange={(e) => setOnlineOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-slate-700">Online Now</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Category Tabs */}
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
            <span className="mr-1">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Smart Match Banner */}
      {(userTool || userDosh) && filteredAndSorted.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-amber-900 mb-2">
            <Zap className="w-4 h-4" />
            <span className="font-bold">Smart Recommendations</span>
            <span>•</span>
            <span>Sorted by relevance to your {userTool || 'query'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filteredAndSorted.slice(0, 3).map((a, i) => {
              const tags = getSmartMatchTags(a);
              return tags.length > 0 && (
                <span key={`${a.id}-${i}`} className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                  {a.name.split(' ')[1] || a.name}: {tags[0]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Astrologers Grid */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSorted.map((astrologer) => (
            <AstrologerCard
              key={astrologer.id}
              astrologer={astrologer}
              onInitiateChat={handleInitiateChat}
              onInitiateCall={handleInitiateCall}
              smartTags={getSmartMatchTags(astrologer)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Astrologers Match Your Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your filters or search keywords to view other verified pandits.
          </p>
          <button
            onClick={() => { 
              setActiveCategory('all');
              setPriceRange([0, 100]);
              setSelectedLanguages([]);
              setVerifiedOnly(false);
              setOnlineOnly(false);
            }}
            className="text-xs font-bold text-amber-600 hover:underline pt-2 inline-block"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </section>
  );
};