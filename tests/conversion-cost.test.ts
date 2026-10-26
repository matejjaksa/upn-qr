import { afterEach, describe, expect, it, vi } from "vitest";
import { conversionCost } from "../lib/extraction/cost";
import { extractInvoiceFromPdf } from "../lib/extraction/openai";
import { emptyExtractedFields } from "../lib/extraction/schema";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("invoice conversion cost", () => {
  it("accounts for cached input and all output tokens", () => {
    expect(conversionCost("gpt-5.6-sol", {
      input_tokens: 2000, input_tokens_details: { cached_tokens: 1000 }, output_tokens: 500
    }).usd).toBeCloseTo(0.0144);
  });

  it("does not invent a cost for missing usage, unknown pricing or nonstandard tiers", () => {
    expect(conversionCost("gpt-5.6-sol").usd).toBeNull();
    expect(conversionCost("unknown", { input_tokens: 1, output_tokens: 1 }).usd).toBeNull();
    expect(conversionCost("gpt-5.6-sol", { input_tokens: 1, output_tokens: 1 }, "flex").usd).toBeNull();
    expect(conversionCost("gpt-5.6-sol", { input_tokens: 1, output_tokens: 1, input_tokens_details: { cached_tokens: 2 } }).usd).toBeNull();
  });

  it("applies long-context rates", () => {
    expect(conversionCost("gpt-5.6-sol", { input_tokens: 300000, output_tokens: 1000 }).usd).toBeCloseTo(2.43);
  });

  it("returns invoice fields and actual response usage together", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_EXTRACTION_MODEL", "gpt-5.6-sol");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      model: "gpt-5.6-sol", output_text: JSON.stringify(emptyExtractedFields),
      usage: { input_tokens: 1000, output_tokens: 100 }
    }))));
    const result = await extractInvoiceFromPdf(Buffer.from("test"), "invoice.pdf");
    expect(result.fields).toEqual(emptyExtractedFields);
    expect(result.cost.usd).toBeCloseTo(0.006);
    expect(result.cost.inputTokens).toBe(1000);
  });
});
