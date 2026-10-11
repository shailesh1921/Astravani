export interface PerformanceMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  startTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;
  private onMetricCallback?: (metric: PerformanceMetric) => void;

  init(onMetric?: (metric: PerformanceMetric) => void) {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.onMetricCallback = onMetric;
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
    this.observeINP();
    this.observeFCP();
    this.observeResources();
    
    this.isInitialized = true;
    console.log('[Performance] Monitoring initialized');
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number };
        const value = lastEntry.renderTime || lastEntry.startTime;
        const metric = this.createMetric('LCP', value);
        this.recordMetric(metric);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] LCP observation not supported');
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          const value = fidEntry.processingStart - fidEntry.startTime;
          const metric = this.createMetric('FID', value);
          this.recordMetric(metric);
        });
      });
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] FID observation not supported');
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            const metric = this.createMetric('CLS', clsValue);
            this.recordMetric(metric);
          }
        });
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] CLS observation not supported');
    }
  }

  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          const value = navEntry.responseStart - navEntry.requestStart;
          const metric = this.createMetric('TTFB', value);
          this.recordMetric(metric);
        });
      });
      observer.observe({ type: 'navigation', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] TTFB observation not supported');
    }
  }

  private observeINP() {
    try {
      let inpValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const eventEntry = entry as PerformanceEventTiming;
          const value = eventEntry.duration;
          if (value > inpValue) {
            inpValue = value;
            const metric = this.createMetric('INP', inpValue);
            this.recordMetric(metric);
          }
        });
      });
      observer.observe({ type: 'event', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] INP observation not supported');
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const metric = this.createMetric('FCP', entry.startTime);
            this.recordMetric(metric);
          }
        });
      });
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] FCP observation not supported');
    }
  }

  private observeResources() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > 1000) {
            console.warn(`[Performance] Slow resource: ${resourceEntry.name} took ${resourceEntry.duration.toFixed(0)}ms`);
          }
        });
      });
      observer.observe({ type: 'resource', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('[Performance] Resource timing observation not supported');
    }
  }

  private createMetric(name: PerformanceMetric['name'], value: number): PerformanceMetric {
    let rating: PerformanceMetric['rating'] = 'good';
    
    switch (name) {
      case 'LCP':
        rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
        break;
      case 'FID':
        rating = value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
        break;
      case 'CLS':
        rating = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
        break;
      case 'TTFB':
        rating = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
        break;
      case 'INP':
        rating = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
        break;
      case 'FCP':
        rating = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
        break;
    }

    return {
      name,
      value: Math.round(value * 100) / 100,
      rating,
      timestamp: Date.now(),
      url: window.location.href,
    };
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.onMetricCallback) {
      this.onMetricCallback(metric);
    }
    console.log(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getLatestMetric(name: PerformanceMetric['name']): PerformanceMetric | null {
    const filtered = this.metrics.filter(m => m.name === name);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }

  getSummary() {
    const summary: Record<string, PerformanceMetric | null> = {};
    for (const name of ['LCP', 'FID', 'CLS', 'TTFB', 'INP', 'FCP'] as const) {
      summary[name] = this.getLatestMetric(name);
    }
    return summary;
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().then(
    (result) => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  );
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    console.log(`[Performance] ${name} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}