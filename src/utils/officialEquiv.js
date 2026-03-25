import { Q } from '../api';

// Official prices (input $/1M tokens) for reference models
const OFFICIAL_PRICES = [
  // Claude
  { pattern: 'claude-4-sonnet', label: 'Claude Sonnet 4', inputPerMtok: 3 },
  { pattern: 'claude-sonnet-4', label: 'Claude Sonnet 4', inputPerMtok: 3 },
  { pattern: 'claude-4.5-sonnet', label: 'Claude 4.5 Sonnet', inputPerMtok: 3 },
  { pattern: 'claude-4.6-sonnet', label: 'Claude 4.6 Sonnet', inputPerMtok: 3 },
  { pattern: 'claude-4-opus', label: 'Claude Opus 4', inputPerMtok: 15 },
  { pattern: 'claude-opus-4', label: 'Claude Opus 4', inputPerMtok: 15 },
  { pattern: 'claude-4.1-opus', label: 'Claude Opus 4.1', inputPerMtok: 15 },
  { pattern: 'claude-4.5-opus', label: 'Claude Opus 4.5', inputPerMtok: 5 },
  { pattern: 'claude-4.6-opus', label: 'Claude Opus 4.6', inputPerMtok: 5 },
  { pattern: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku', inputPerMtok: 0.8 },
  { pattern: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', inputPerMtok: 0.8 },
  // OpenAI
  { pattern: 'gpt-5.1', label: 'GPT-5.1', inputPerMtok: 1.25 },
  { pattern: 'gpt-5.2', label: 'GPT-5.2', inputPerMtok: 1.75 },
  { pattern: 'gpt-5.3', label: 'GPT-5.3', inputPerMtok: 1.75 },
  { pattern: 'gpt-5.4', label: 'GPT-5.4', inputPerMtok: 2.5 },
  { pattern: 'gpt-4o', label: 'GPT-4o', inputPerMtok: 2.5 },
  { pattern: 'gpt-4.1', label: 'GPT-4.1', inputPerMtok: 2 },
  // Gemini
  { pattern: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', inputPerMtok: 1.25 },
  { pattern: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', inputPerMtok: 0.15 },
  { pattern: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', inputPerMtok: 0.1 },
  { pattern: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', inputPerMtok: 1.25 },
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
