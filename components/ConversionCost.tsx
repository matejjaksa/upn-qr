import type { ConversionCost as Cost } from "../lib/extraction/types";

export function ConversionCost({ cost }: { cost: Cost }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
      <strong className="block text-slate-900">
        Invoice conversion: {cost.usd === null ? "cost unavailable" : `~$${cost.usd.toFixed(6)} USD`}
      </strong>
      <span className="mt-1 block text-xs">
        {cost.model} · {cost.inputTokens ?? "?"} input tokens ({cost.cachedInputTokens} cached) · {cost.outputTokens ?? "?"} output tokens
      </span>
      <span className="mt-1 block text-xs">
        {cost.usd === null ? "No supported price or usage data was returned." : `Estimate at published rates (${cost.pricingDate}); final billing may vary.`} QR generation adds no API cost.
      </span>
    </div>
  );
}
