// AstraVani Growth Experiment (A/B Testing) Framework
// Deterministic bucket assignment per visitor + conversion tracking per variant.

import { analytics } from './analytics';

export interface ExperimentDefinition {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    label: string;
    weight: number; // relative weight, e.g. 50 = 50% (normalised automatically)
  }>;
  metricEvents: string[]; // events counted as conversions
  status: 'active' | 'paused';
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: number;
}

const STORAGE_KEY = 'astravani_experiments_v1';

/**
 * Active growth experiments.
 * Add new experiments here — assignment is deterministic and sticky per visitor.
 */
export const EXPERIMENTS: ExperimentDefinition[] = [
  {
    id: 'hero_cta_copy_v1',
    name: 'Hero CTA Copy',
    description: 'Tests urgency ("1st Min 100% Free") vs. trust ("Verified Acharya in 60s") framing on the primary hero CTA.',
    variants: [
      { id: 'control_free', label: '1st Min 100% Free', weight: 50 },
      { id: 'variant_verified', label: 'Verified Acharya in 60s', weight: 50 }
    ],
    metricEvents: ['consultation_start', 'kundli_generate', 'free_tool_to_consult'],
    status: 'active'
  },
  {
    id: 'astrologer_grid_sort_v1',
    name: 'Default Astrologer Sort',
    description: 'Tests Smart Match (personalised) vs Most Popular (social proof) as the default astrologer grid ordering.',
    variants: [
      { id: 'control_popular', label: 'Most Popular', weight: 50 },
      { id: 'variant_smart', label: 'Smart Match', weight: 50 }
    ],
    metricEvents: ['consultation_start', 'astrologer_chat_initiated', 'astrologer_call_initiated'],
    status: 'active'
  },
  {
    id: 'consult_upsell_timing_v1',
    name: 'Dosh Consultation Upsell',
    description: 'Tests immediate specialist CTA vs. educate-first (remedies before CTA) on the Dosh Encyclopedia detail modal.',
    variants: [
      { id: 'control_immediate', label: 'Immediate CTA', weight: 50 },
      { id: 'variant_educate', label: 'Educate First', weight: 50 }
    ],
    metricEvents: ['free_tool_to_consult', 'dosh_view'],
    status: 'active'
  }
];

function readStore(): Record<string, ExperimentAssignment> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore corrupted store
  }
  return {};
}

function writeStore(store: Record<string, ExperimentAssignment>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    // ignore storage failures (private mode)
  }
}

/** Stable 32-bit hash of a string — ensures deterministic bucketing per visitor. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

let visitorId: string | null = null;

/** Returns an anonymous, sticky visitor id used for deterministic bucketing. */
export function getVisitorId(): string {
  if (visitorId) return visitorId;
  try {
    const key = 'astravani_visitor_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(key, id);
    }
    visitorId = id;
    return id;
  } catch (e) {
    // Private-mode fallback: session-scoped
    visitorId = `v_session_${Math.random().toString(36).slice(2, 10)}`;
    return visitorId;
  }
}

/**
 * Deterministically assigns the visitor to a variant for an experiment.
 * Returns null when the experiment is missing, paused, or has no variants.
 */
export function getVariant(experimentId: string): string | null {
  const experiment = EXPERIMENTS.find(e => e.id === experimentId);
  if (!experiment || experiment.status !== 'active' || experiment.variants.length === 0) {
    return null;
  }

  const store = readStore();
  const existing = store[experimentId];
  if (existing && experiment.variants.some(v => v.id === existing.variantId)) {
    return existing.variantId;
  }

  // Deterministic bucket: same visitor -> same hash -> same variant, forever
  const hash = hashString(`${getVisitorId()}::${experimentId}`);
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  let cursor = hash % totalWeight;

  let selected = experiment.variants[experiment.variants.length - 1].id;
  for (const variant of experiment.variants) {
    if (cursor < variant.weight) {
      selected = variant.id;
      break;
    }
    cursor -= variant.weight;
  }

  store[experimentId] = {
    experimentId,
    variantId: selected,
    assignedAt: Date.now()
  };
  writeStore(store);

  try {
    analytics.trackEvent('experiment_assigned', {
      experiment_id: experimentId,
      variant_id: selected,
    });
  } catch (e) {
    // ignore
  }

  return selected;
}

/** Returns the human-readable label of the assigned variant (for UI copy). */
export function getVariantLabel(experimentId: string): string | null {
  const variantId = getVariant(experimentId);
  if (!variantId) return null;
  const experiment = EXPERIMENTS.find(e => e.id === experimentId);
  return experiment?.variants.find(v => v.id === variantId)?.label || null;
}

/** Convenience boolean helper for 2-variant experiments. */
export function isVariant(experimentId: string, variantId: string): boolean {
  return getVariant(experimentId) === variantId;
}

/** Attaches active experiment assignments to any analytics event. */
export function getExperimentContext(): Record<string, string> {
  const store = readStore();
  const context: Record<string, string> = {};
  Object.values(store).forEach((assignment) => {
    context[`exp_${assignment.experimentId}`] = assignment.variantId;
  });
  return context;
}

/** Registers the experiment context as GA4 user properties for cross-filtering. */
export function syncExperimentContext() {
  const context = getExperimentContext();
  if (Object.keys(context).length > 0) {
    analytics.setUserProperties(context);
  }
}

/** Returns every active experiment definition (for a dev/debug panel). */
export function listActiveExperiments(): ExperimentDefinition[] {
  return EXPERIMENTS.filter(e => e.status === 'active');
}

/** Clears all experiment assignments (useful when QA-ing variants). */
export function resetExperiments() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
