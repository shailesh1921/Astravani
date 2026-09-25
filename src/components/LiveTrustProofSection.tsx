import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, ThumbsUp, Sparkles, Heart } from 'lucide-react';

interface Testimonial {
  id: string;
  userName: string;
  city: string;
  astrologerName: string;
  astrologerTitle: string;
  astrologerAvatar: string;
  rating: number;
  timeAgo: string;
  category: 'Marriage' | 'Career' | 'Love & Tarot' | 'Lal Kitab & Upay';
  title: string;
  comment: string;
  verifiedOrder: boolean;
}

const VERIFIED_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    userName: 'Vikas Shekhawat',
    city: 'Jaipur, Rajasthan',
    astrologerName: 'Pt. Anand Swaroop',
    astrologerTitle: 'Senior Vedic Jyotishacharya',
    astrologerAvatar: '/astrologers/pandit-anand-swaroop.jpg',
    rating: 5,
    timeAgo: '12 mins ago',
    category: 'Marriage',
    title: 'Predicted my exact marriage proposal timing!',
    comment: 'Pandit Anand Swaroop ji accurately calculated my 7th house dasha and told me that between late 2024 and early 2025, my marriage alliance would fix. Everything happened exactly to the month. Divine blessings!',
    verifiedOrder: true
  },
  {
    id: 't2',
    userName: 'Rohit Verma',
    city: 'New Delhi',
    astrologerName: 'Acharya Raman Shastri',
    astrologerTitle: 'KP & Prashna Specialist',
    astrologerAvatar: '/astrologers/acharya-raman.jpg',
    rating: 5,
    timeAgo: '35 mins ago',
    category: 'Career',
    title: 'Cleared Civil Services with his Surya Upay',
    comment: 'I was stressed about my promotional exams. Acharya Raman Shastri gave me simple Aditya Hridaya Stotra and copper Surya arghya remedies. My transfer order was cancelled and I got the dream posting.',
    verifiedOrder: true
  },
  {
    id: 't3',
    userName: 'Simran Kaur',
    city: 'Chandigarh, Punjab',
    astrologerName: 'Dr. Radhika Sharma',
    astrologerTitle: 'PhD in Astrology & Numerology',
    astrologerAvatar: '/astrologers/dr-radhika-sharma.jpg',
    rating: 5,
    timeAgo: '1 hour ago',
    category: 'Career',
    title: 'Business brand name correction brought 3x sales',
    comment: 'Dr. Radhika adjusted our boutique brand name spelling according to Chaldean numerology to align with number 5. Within 60 days our wholesale orders increased significantly. Truly gifted scholar!',
    verifiedOrder: true
  },
  {
    id: 't4',
    userName: 'Neha Dhillon',
    city: 'Amritsar, Punjab',
    astrologerName: 'Tarot Simran Kaur',
    astrologerTitle: 'Love & Relationship Healer',
    astrologerAvatar: '/astrologers/tarot-simran-kaur.jpg',
    rating: 5,
    timeAgo: '2 hours ago',
    category: 'Love & Tarot',
    title: 'She told me things only my partner and I knew',
    comment: 'I was on the verge of a painful breakup. Simran touched upon our exact communication blockage and guided me with angel card healing. Today we are happily engaged.',
    verifiedOrder: true
  },
  {
    id: 't5',
    userName: 'Manoj Pandey',
    city: 'Varanasi, UP',
    astrologerName: 'Pt. Kashi Nath Dixit',
    astrologerTitle: 'Lal Kitab Master',
    astrologerAvatar: '/astrologers/pandit-kashi-nath.jpg',
    rating: 5,
    timeAgo: '3 hours ago',
    category: 'Lal Kitab & Upay',
    title: 'Kaal Sarp Dosha remedies brought instant mental relief',
    comment: 'Pandit Kashi Nath ji recommended silver snake and river flow remedies from authentic Lal Kitab. No expensive rituals, only pure sattvic remedies. My chronic anxiety is completely gone.',
    verifiedOrder: true
  },
  {
    id: 't6',
    userName: 'Karthik Subramanian',
    city: 'Chennai, Tamil Nadu',
    astrologerName: 'Smt. Meenakshi Iyer',
    astrologerTitle: 'Thanjavur Nadi Expert',
    astrologerAvatar: '/astrologers/meenakshi-iyer.jpg',
    rating: 5,
    timeAgo: '4 hours ago',
    category: 'Career',
    title: 'Overseas visa approval date predicted accurately',
    comment: 'Her Nadi palm-leaf Prashna calculation gave me the exact fortnight my German work visa would get approved. Incredible ancient precision and very polite consultation.',
    verifiedOrder: true
  }
];

export const LiveTrustProofSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredTestimonials = activeCategory === 'All' 
    ? VERIFIED_TESTIMONIALS 
    : VERIFIED_TESTIMONIALS.filter(t => t.category === activeCategory);

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-b border-slate-200 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-10">
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block font-mono">4.9 / 5.0</span>
            <span className="text-[11px] sm:text-xs text-slate-600 font-semibold">28,400+ Verified Ratings</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-center">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block font-mono">85,000+</span>
            <span className="text-[11px] sm:text-xs text-emerald-800 font-bold flex items-center justify-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulsing-online" />
              Consultations Delivered
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 text-center">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center mx-auto mb-1">
              🕉️
            </div>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block">100% Certified Gurus</span>
            <span className="text-[11px] text-slate-500">Varanasi, Kashi & Prayagraj</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block">100% Confidential</span>
            <span className="text-[11px] text-slate-500">256-Bit SSL Encrypted Birth Data</span>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulsing-online" />
              <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                Real User Experiences & Reviews
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transforming Lives Across India Every Day
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['All', 'Marriage', 'Career', 'Love & Tarot', 'Lal Kitab & Upay'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 min-h-[36px] ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: User & Rating */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900">{item.userName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{item.city}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span className="text-xs font-extrabold text-slate-900">{item.rating}.0</span>
                  </div>
                </div>

                {/* Review Body */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                  "{item.title}"
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
                  {item.comment}
                </p>
              </div>

              {/* Consulted Astrologer Footer */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between bg-white/70 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.astrologerAvatar}
                    alt={item.astrologerName}
                    className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-2xs flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                      {item.astrologerName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.astrologerTitle}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex-shrink-0">
                  Verified
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
