import { Q } from '../api';

// Official prices (input $/1M tokens) for reference models
const OFFICIAL_PRICES = [
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
  { pattern: 'gpt-5.1', label: 'GPT-5.1', inputPerMtok: 1.25 },
  { pattern: 'gpt-5.2', label: 'GPT-5.2', inputPerMtok: 1.75 },
  { pattern: 'gpt-5.3', label: 'GPT-5.3', inputPerMtok: 1.75 },
  { pattern: 'gpt-5.4', label: 'GPT-5.4', inputPerMtok: 2.5 },
  { pattern: 'gpt-4o', label: 'GPT-4o', inputPerMtok: 2.5 },
  { pattern: 'gpt-4.1', label: 'GPT-4.1', inputPerMtok: 2 },
];

/**
 * Find the best official equivalent for a given quota.
 * Picks the model with the highest ratio (biggest discount advantage).
 *
 * @param {Array} models - site models with input_price ($/1K tokens)
 * @param {number} quotaDollars - package quota in USD
 * @returns {{ label: string, equivDollars: number } | null}
 */
export function calcOfficialEquiv(models, quotaDollars) {
  if (!models || models.length === 0 || quotaDollars <= 0) return null;

  let bestResult = null;

  for (const m of models) {
    const siteInputPrice = Number(m.input_price);
    if (!siteInputPrice || siteInputPrice <= 0) continue;

    const modelName = (m.model_name || '').toLowerCase();

    for (const official of OFFICIAL_PRICES) {
      if (modelName.includes(official.pattern.toLowerCase())) {
        const sitePricePerMtok = siteInputPrice * 1000;
        const ratio = official.inputPerMtok / sitePricePerMtok;
        const equivDollars = quotaDollars * ratio;

        if (!bestResult || equivDollars > bestResult.equivDollars) {
          bestResult = { label: official.label, equivDollars, ratio };
        }
        break;
      }
    }
  }

  return bestResult;
}

/**
 * Convenience: compute equiv from raw quota units + models.
 */
export function calcPkgEquiv(models, quotaAmount) {
  const quotaDollars = quotaAmount > 0 ? quotaAmount / Q : 0;
  return calcOfficialEquiv(models, quotaDollars);
}
