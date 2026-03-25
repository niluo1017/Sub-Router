import { Q } from '../api';

// Official prices (input $/1M tokens) for reference models.
// These are the REAL official API prices from Anthropic, OpenAI, Google etc.
// IMPORTANT: More specific patterns MUST come before less specific ones
// (e.g. "claude-opus-4-5" before "claude-opus-4") to avoid false matches.
// Patterns must match actual backend model_name format (e.g. "claude-opus-4-5-20251101").
const OFFICIAL_PRICES = [
  // Claude — order matters: longer/more-specific first
  { pattern: 'claude-opus-4-5', label: 'Claude Opus 4.5', inputPerMtok: 5 },
  { pattern: 'claude-opus-4-6', label: 'Claude Opus 4.6', inputPerMtok: 5 },
  { pattern: 'claude-opus-4-1', label: 'Claude Opus 4.1', inputPerMtok: 15 },
  { pattern: 'claude-opus-4', label: 'Claude Opus 4', inputPerMtok: 15 },
  { pattern: 'claude-3-opus', label: 'Claude 3 Opus', inputPerMtok: 15 },
  { pattern: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', inputPerMtok: 3 },
  { pattern: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', inputPerMtok: 3 },
  { pattern: 'claude-sonnet-4', label: 'Claude Sonnet 4', inputPerMtok: 3 },
  { pattern: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet', inputPerMtok: 3 },
  { pattern: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', inputPerMtok: 3 },
  { pattern: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', inputPerMtok: 1 },
  { pattern: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', inputPerMtok: 0.8 },
  { pattern: 'claude-3-haiku', label: 'Claude 3 Haiku', inputPerMtok: 0.25 },
  // OpenAI — more specific first
  { pattern: 'gpt-4o-mini', label: 'GPT-4o Mini', inputPerMtok: 0.15 },
  { pattern: 'gpt-4o-2024-05-13', label: 'GPT-4o', inputPerMtok: 5 },
  { pattern: 'chatgpt-4o-latest', label: 'GPT-4o', inputPerMtok: 5 },
  { pattern: 'gpt-4o', label: 'GPT-4o', inputPerMtok: 2.5 },
  { pattern: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', inputPerMtok: 0.4 },
  { pattern: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', inputPerMtok: 0.1 },
  { pattern: 'gpt-4.1', label: 'GPT-4.1', inputPerMtok: 2 },
  { pattern: 'gpt-5.4', label: 'GPT-5.4', inputPerMtok: 2.5 },
  { pattern: 'gpt-5.3', label: 'GPT-5.3', inputPerMtok: 1.75 },
  { pattern: 'gpt-5.2', label: 'GPT-5.2', inputPerMtok: 1.75 },
  { pattern: 'gpt-5.1', label: 'GPT-5.1', inputPerMtok: 1.25 },
  // Gemini — more specific first
  { pattern: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', inputPerMtok: 0.04 },
  { pattern: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', inputPerMtok: 0.15 },
  { pattern: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', inputPerMtok: 1.25 },
  { pattern: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', inputPerMtok: 0.1 },
  { pattern: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', inputPerMtok: 1.25 },
  { pattern: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', inputPerMtok: 0.075 },
  // DeepSeek
  { pattern: 'deepseek-r1', label: 'DeepSeek R1', inputPerMtok: 0.55 },
  { pattern: 'deepseek-chat', label: 'DeepSeek V3', inputPerMtok: 0.27 },
  { pattern: 'deepseek-v3', label: 'DeepSeek V3', inputPerMtok: 0.27 },
];

/**
 * Find ALL official equivalents for a given quota.
 * Returns array of { label, equivDollars } sorted by equivDollars desc.
 * Only includes results where equivDollars > quotaDollars.
 * Deduplicates by label (keeps best ratio per model label).
 */
export function calcOfficialEquivList(models, quotaDollars) {
  if (!models || models.length === 0 || quotaDollars <= 0) return [];

  // label -> best equivDollars
  const bestByLabel = {};

  for (const m of models) {
    const siteInputPrice = Number(m.input_price);
    if (!siteInputPrice || siteInputPrice <= 0) continue;

    const modelName = (m.model_name || '').toLowerCase();

    for (const official of OFFICIAL_PRICES) {
      if (modelName.includes(official.pattern.toLowerCase())) {
        const sitePricePerMtok = siteInputPrice * 1000;
        const ratio = official.inputPerMtok / sitePricePerMtok;
        const equivDollars = quotaDollars * ratio;

        if (equivDollars > quotaDollars) {
          if (!bestByLabel[official.label] || equivDollars > bestByLabel[official.label]) {
            bestByLabel[official.label] = equivDollars;
          }
        }
        break;
      }
    }
  }

  return Object.entries(bestByLabel)
    .map(([label, equivDollars]) => ({ label, equivDollars: Math.round(equivDollars) }))
    .sort((a, b) => b.equivDollars - a.equivDollars)
    .slice(0, 3);
}

/**
 * Legacy single-result API (kept for compatibility).
 */
export function calcOfficialEquiv(models, quotaDollars) {
  const list = calcOfficialEquivList(models, quotaDollars);
  return list.length > 0 ? list[0] : null;
}
