declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    clarity: (...args: unknown[]) => void;
  }
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface EcommerceEvent {
  event: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'view_cart';
  ecommerce: {
    currency: 'INR';
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      price: number;
      quantity: 1;
      astrologer_id?: string;
      astrologer_name?: string;
    }>;
  };
}

export interface UserProperties {
  user_id?: string;
  user_type: 'guest' | 'authenticated';
  preferred_language?: string;
  has_free_trial?: boolean;
  wallet_balance?: number;
  total_consultations?: number;
  /** Extra dimensions for growth experiments (exp_*) and custom segmentation. */
  [key: string]: unknown;
}

class AnalyticsService {
  private gaMeasurementId: string;
  private clarityProjectId: string;
  private isInitialized = false;
  private userId: string | null = null;
  private userProperties: UserProperties = { user_type: 'guest' };

  constructor() {
    this.gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
    this.clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID || '';
  }

  init(userId?: string, userProps?: Partial<UserProperties>) {
    if (this.isInitialized) return;

    this.userId = userId || null;
    if (userProps) {
      this.userProperties = { ...this.userProperties, ...userProps };
    }

    this.initGA4();
    this.initClarity();
    this.isInitialized = true;
  }

  private initGA4() {
    if (!this.gaMeasurementId) {
      console.warn('[Analytics] GA4 Measurement ID not configured');
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.gaMeasurementId, {
      send_page_view: false,
      custom_map: {
        dimension1: 'user_type',
        dimension2: 'preferred_language',
        dimension3: 'has_free_trial',
        dimension4: 'wallet_balance',
        dimension5: 'total_consultations',
      },
    });

    this.setUserProperties(this.userProperties);

    console.log('[Analytics] GA4 initialized with', this.gaMeasurementId);
  }

  private initClarity() {
    if (!this.clarityProjectId) {
      console.warn('[Analytics] Clarity Project ID not configured');
      return;
    }

    const c = window as any;
    const l = document;
    const a = 'clarity';
    const r = 'script';
    const i = this.clarityProjectId;
    
    c[a] = c[a] || function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
    const t = l.createElement(r);
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);

    console.log('[Analytics] Clarity initialized with', this.clarityProjectId);
  }

  setUserProperties(props: Partial<UserProperties>) {
    this.userProperties = { ...this.userProperties, ...props };
    
    if (this.gaMeasurementId && window.gtag) {
      window.gtag('set', 'user_properties', this.userProperties);
      if (this.userId) {
        window.gtag('set', 'user_id', this.userId);
      }
    }
  }

  trackPageView(pagePath: string, pageTitle: string) {
    if (this.gaMeasurementId && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
        user_type: this.userProperties.user_type,
      });
    }
  }

  trackEvent(eventName: string, properties?: Record<string, unknown>) {
    if (this.gaMeasurementId && window.gtag) {
      window.gtag('event', eventName, {
        ...properties,
        user_type: this.userProperties.user_type,
      });
    }
  }

  trackEcommerce(event: EcommerceEvent) {
    if (this.gaMeasurementId && window.gtag) {
      window.gtag('event', event.event, event.ecommerce);
    }
  }

  trackKundliGenerate(input: { has_dob: boolean; has_tob: boolean; has_pob: boolean }) {
    this.trackEvent('kundli_generate', {
      has_date_of_birth: input.has_dob,
      has_time_of_birth: input.has_tob,
      has_place_of_birth: input.has_pob,
    });
  }

  trackKundliMatch(input: { score: number; verdict: string; has_manglik: boolean }) {
    this.trackEvent('kundli_match', {
      guna_score: input.score,
      verdict: input.verdict,
      manglik_detected: input.has_manglik,
    });
  }

  trackHoroscopeView(input: { sign: string; timeframe: string }) {
    this.trackEvent('horoscope_view', {
      zodiac_sign: input.sign,
      timeframe: input.timeframe,
    });
  }

  trackBlogRead(input: { article_id: string; category: string; read_time_seconds?: number }) {
    this.trackEvent('blog_read', {
      article_id: input.article_id,
      category: input.category,
      read_time: input.read_time_seconds,
    });
  }

  trackAstrologerView(input: { astrologer_id: string; astrologer_name: string; specialization: string[] }) {
    this.trackEvent('astrologer_view', {
      astrologer_id: input.astrologer_id,
      astrologer_name: input.astrologer_name,
      specializations: input.specialization.join(','),
    });
  }

  trackConsultationStart(input: { astrologer_id: string; mode: 'chat' | 'call'; is_free_trial: boolean }) {
    this.trackEvent('consultation_start', {
      astrologer_id: input.astrologer_id,
      mode: input.mode,
      free_trial: input.is_free_trial,
    });
  }

  trackConsultationComplete(input: { 
    astrologer_id: string; 
    duration_seconds: number; 
    amount_paid: number; 
    mode: 'chat' | 'call';
    free_trial_used: boolean;
  }) {
    this.trackEvent('consultation_complete', {
      astrologer_id: input.astrologer_id,
      duration_seconds: input.duration_seconds,
      amount_paid: input.amount_paid,
      mode: input.mode,
      free_trial_used: input.free_trial_used,
    });

    if (input.amount_paid > 0) {
      this.trackEcommerce({
        event: 'purchase',
        ecommerce: {
          currency: 'INR',
          value: input.amount_paid,
          items: [{
            item_id: `consultation_${input.astrologer_id}`,
            item_name: `Consultation with ${input.astrologer_id}`,
            category: 'astrology_consultation',
            price: input.amount_paid,
            quantity: 1,
          }],
        },
      });
    }
  }

  trackWalletRecharge(input: { amount: number; bonus: number; method: string }) {
    this.trackEvent('wallet_recharge', {
      amount: input.amount,
      bonus_credit: input.bonus,
      payment_method: input.method,
    });

    this.trackEcommerce({
      event: 'purchase',
      ecommerce: {
        currency: 'INR',
        value: input.amount,
        items: [{
          item_id: 'wallet_recharge',
          item_name: 'Wallet Recharge',
          category: 'wallet',
          price: input.amount,
          quantity: 1,
        }],
      },
    });
  }

  trackFreeToolToConsult(input: { tool: 'kundli' | 'matching' | 'horoscope' | 'blog' | 'dosh' | (string & {}); astrologer_id?: string }) {
    this.trackEvent('free_tool_to_consult', {
      source_tool: input.tool,
      astrologer_id: input.astrologer_id,
    });
  }

  trackSearch(input: { query: string; results_count: number; source?: string }) {
    this.trackEvent('search', {
      search_term: input.query,
      results_count: input.results_count,
      search_source: input.source,
    });
  }

  trackError(input: { error_message: string; error_location: string; fatal: boolean }) {
    this.trackEvent('exception', {
      description: input.error_message,
      fatal: input.fatal,
      location: input.error_location,
    });
  }

  trackPerformance(input: { metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP'; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) {
    this.trackEvent('web_vital', {
      metric_name: input.metric,
      metric_value: input.value,
      metric_rating: input.rating,
    });
  }
}

export const analytics = new AnalyticsService();