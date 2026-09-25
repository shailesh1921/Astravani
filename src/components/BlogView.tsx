import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Search, Clock, Calendar, User, Share2, 
  CheckCircle2, HelpCircle, ArrowLeft, Sparkles, MessageSquare, 
  ChevronRight, Bookmark, Flame, Star, Compass, ScrollText
} from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogData';

interface BlogViewProps {
  onConsultArticle?: (articleTopic: string) => void;
  onOpenKundli?: () => void;
  onOpenMatching?: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ 
  onConsultArticle, 
  onOpenKundli, 
  onOpenMatching 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check URL params on load to support direct deep linking (e.g., ?article=kaal-sarp-dosh)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleParam = params.get('article');
    if (articleParam) {
      const match = BLOG_ARTICLES.find(a => a.id === articleParam || a.slug === articleParam);
      if (match) {
        setActiveArticleId(match.id);
      }
    }
  }, []);

  const activeArticle = useMemo(() => {
    return BLOG_ARTICLES.find(a => a.id === activeArticleId) || null;
  }, [activeArticleId]);

  const categories = [
    { id: 'all', label: 'सभी लेख (All)', icon: '📚' },
    { id: 'dosha', label: 'दोष एवं उपाय (Dosha)', icon: '🐍' },
    { id: 'marriage', label: 'विवाह मिलान (Marriage)', icon: '💍' },
    { id: 'graha', label: 'ग्रह एवं दशा (Planets)', icon: '🪐' },
    { id: 'vastu', label: 'वास्तु शास्त्र (Vastu)', icon: '🏡' },
  ];

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        article.title.toLowerCase().includes(q) ||
        article.hindiTitle.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.tags.some(t => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleShareWhatsApp = (article: BlogArticle) => {
    const shareUrl = `https://www.astravani.in/?tab=blog&article=${article.id}&utm_source=whatsapp&utm_medium=blog_share`;
    const message = encodeURIComponent(
      `🔮 *${article.hindiTitle}*\n\n${article.excerpt}\n\n📖 *पूरा लेख यहाँ पढ़ें और अपनी कुंडली देखें:* 👇\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleCopyLink = (article: BlogArticle) => {
    const shareUrl = `https://www.astravani.in/?tab=blog&article=${article.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Scroll to top when opening an article
  const openArticle = (id: string) => {
    setActiveArticleId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'blog');
      url.searchParams.set('article', id);
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };

  const closeArticle = () => {
    setActiveArticleId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'blog');
      url.searchParams.delete('article');
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };

  // ---------------- SINGLE ARTICLE READER VIEW ----------------
  if (activeArticle) {
    const relatedArticles = BLOG_ARTICLES.filter(a => a.id !== activeArticle.id).slice(0, 3);

    return (
      <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={closeArticle}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-600 hover:border-amber-300 transition text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>वापस सभी लेख (Back to Blog)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShareWhatsApp(activeArticle)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition text-xs font-bold shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp Share</span>
              </button>
              <button
                onClick={() => handleCopyLink(activeArticle)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                <span>{copiedLink ? 'Copied! ✓' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Article Header Card */}
          <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className={`p-6 sm:p-10 bg-gradient-to-br ${activeArticle.gradient} text-white relative overflow-hidden`}>
              <div className="absolute -right-6 -bottom-6 text-8xl opacity-20 pointer-events-none select-none">
                {activeArticle.coverEmoji}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide uppercase mb-4 border border-white/30">
                <span>{activeArticle.coverEmoji}</span>
                <span>{activeArticle.categoryLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                {activeArticle.hindiTitle}
              </h1>
              <p className="text-amber-200 text-sm sm:text-base font-medium opacity-90 mb-6">
                {activeArticle.title}
              </p>

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40 bg-white/10 flex items-center justify-center">
                    <span className="text-base">{activeArticle.coverEmoji}</span>
                  </div>
                  <div>
                    <span className="font-bold text-white block">{activeArticle.author.name}</span>
                    <span className="text-[10px] text-white/70">{activeArticle.author.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    {activeArticle.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    {activeArticle.publishDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Body Content */}
            <div className="p-6 sm:p-10 space-y-8 text-slate-800 leading-relaxed">
              
              {/* Introduction Callout */}
              <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl text-slate-800 text-sm sm:text-base font-medium leading-relaxed">
                {activeArticle.content.introduction}
              </div>

              {/* In-Article CTA Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-amber-300">
                      अपनी व्यक्तिगत कुंडली में दोष व दशा चेक करें
                    </h4>
                    <p className="text-xs text-slate-300">
                      एस्ट्रोवाणी के वैदिक गुरुओं से तुरंत चैट/कॉल पर सटीक मार्गदर्शन प्राप्त करें
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onConsultArticle) {
                      onConsultArticle(activeArticle.title);
                    } else if (onOpenKundli) {
                      onOpenKundli();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm hover:from-amber-400 hover:to-orange-400 transition shadow-md shadow-amber-500/20 flex-shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>पंडित जी से बात करें (1st Chat Free)</span>
                </button>
              </div>

              {/* Content Sections */}
              {activeArticle.content.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-2 h-6 bg-amber-500 rounded-full inline-block" />
                    {section.heading}
                  </h2>
                  
                  {section.body.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {section.bulletPoints && (
                    <ul className="space-y-2.5 my-3 pl-2">
                      {section.bulletPoints.map((pt, ptIdx) => (
                        <li key={ptIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.highlightBox && (
                    <div className="bg-amber-100/60 border border-amber-300/80 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 font-medium whitespace-pre-line leading-relaxed">
                      {section.highlightBox}
                    </div>
                  )}
                </div>
              ))}

              {/* Remedies Step by Step Box */}
              {activeArticle.content.remedies && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-purple-950 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    {activeArticle.content.remedies.title}
                  </h3>
                  <div className="space-y-2">
                    {activeArticle.content.remedies.steps.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-purple-100 text-xs sm:text-sm text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {sIdx + 1}
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {activeArticle.content.faqs && activeArticle.content.faqs.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                    अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)
                  </h3>
                  <div className="space-y-3">
                    {activeArticle.content.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-900">
                          Q: {faq.question}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          A: {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary / Conclusion */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 text-xs sm:text-sm text-center leading-relaxed">
                <p className="text-slate-300 font-medium">{activeArticle.content.summary}</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleShareWhatsApp(activeArticle)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>मित्रों के साथ शेयर करें (WhatsApp)</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">संबंधित विषय (Tags):</span>
                {activeArticle.tags.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

            </div>
          </article>

          {/* Related Articles Carousel/Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              अन्य महत्वपूर्ण वैदिक ज्योतिष लेख (Recommended Reads)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => openArticle(rel.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{rel.coverEmoji}</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {rel.categoryLabel}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mb-1.5">
                      {rel.hindiTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{rel.readTime}</span>
                    <span className="text-amber-600 font-bold flex items-center gap-0.5">
                      पढ़ें <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ---------------- MAIN BLOG LIST PORTAL ----------------
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <span>✨</span>
            <span>वैदिक ज्ञानकोष एवं ज्योतिष ब्लॉग (AstraVani Vedic Insights)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            प्रामाणिक वैदिक ज्योतिष ज्ञान, कुंडली दोष एवं अचूक उपाय
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            भारत के शीर्ष वैदिक विद्वानों द्वारा रचित काल सर्प दोष, मांगलिक विचार, साढ़े साती, वास्तु शास्त्र और कुंडली मिलान पर वैज्ञानिक एवं शास्त्रीय मार्गदर्शन।
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 max-w-lg mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खोजें: काल सर्प दोष, मांगलिक, साढ़े साती, वास्तु..."
              className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs transition"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => openArticle(article.id)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-amber-300 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover Header */}
                  <div className={`p-5 sm:p-6 bg-gradient-to-br ${article.gradient} text-white relative overflow-hidden`}>
                    <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 group-hover:scale-110 transition-transform select-none pointer-events-none">
                      {article.coverEmoji}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/20">
                      <span>{article.coverEmoji}</span>
                      <span>{article.categoryLabel}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold leading-snug group-hover:text-amber-200 transition line-clamp-2">
                      {article.hindiTitle}
                    </h2>
                    <p className="text-[11px] text-white/80 line-clamp-1 mt-1">
                      {article.title}
                    </p>
                  </div>

                  {/* Excerpt and Author */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs">
                        {article.coverEmoji}
                      </div>
                      <span className="font-semibold text-slate-700 truncate">{article.author.name}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Meta & Actions */}
                <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {article.publishDate}
                    </span>
                  </div>

                  <span className="text-amber-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>पूरा पढ़ें</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-base font-bold text-slate-900 mb-1">कोई लेख नहीं मिला</h3>
            <p className="text-xs text-slate-500 mb-4">
              कृपया अन्य कीवर्ड खोजें या सभी श्रेणियां चुनें।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              सभी लेख देखें
            </button>
          </div>
        )}

        {/* Quick Tools Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2 text-center md:text-left">
              <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">
                AstraVani Free Vedic Tools
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                अपनी जन्म कुंडली और गुण मिलान अभी फ्री में चेक करें
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                100% सटीक वैदिक गणित द्वारा निर्मित कुंडली, 36 गुण मिलान और आज का दैनिक राशिफल।
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <button
                onClick={onOpenKundli}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm hover:from-amber-400 hover:to-orange-400 transition shadow-md shadow-amber-500/20 text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <ScrollText className="w-4 h-4" />
                <span>फ्री जन्म कुंडली बनाएं</span>
              </button>
              <button
                onClick={onOpenMatching}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>36 गुण मिलान चेक करें</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
