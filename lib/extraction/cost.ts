import type { ConversionCost } from "./types";

// Standard USD rates per million tokens, checked 2026-10-26.
// https://developers.openai.com/api/docs/models/gpt-5.6-sol
const SOL_RATES = { input: 4, cached: 0.4, output: 20 };

type ApiUsage = {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { cached_tokens?: number };
};

export function conversionCost(model: string, usage?: ApiUsage, serviceTier?: string): ConversionCost {
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const cachedInputTokens = usage?.input_tokens_details?.cached_tokens ?? 0;
  const knownModel = /^(gpt-5\.6-sol|gpt-5\.6)(-\d{4}-\d{2}-\d{2})?$/.test(model);
  const validUsage = inputTokens !== null && outputTokens !== null &&
    [inputTokens, outputTokens, cachedInputTokens].every(n => Number.isSafeInteger(n) && n >= 0) &&
    cachedInputTokens <= inputTokens;
  const standardTier = !serviceTier || serviceTier === "default";
  const usd = knownModel && validUsage && standardTier
    ? ((inputTokens! - cachedInputTokens) * SOL_RATES.input * (inputTokens! > 272_000 ? 2 : 1) +
        cachedInputTokens * SOL_RATES.cached * (inputTokens! > 272_000 ? 2 : 1) +
        outputTokens! * SOL_RATES.output * (inputTokens! > 272_000 ? 1.5 : 1)) / 1_000_000
    : null;
  return { model, inputTokens, cachedInputTokens, outputTokens, usd, currency: "USD", pricingDate: "2026-10-26" };
}
