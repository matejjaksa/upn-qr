import { describe, expect, it } from "vitest";
import { normalizeAscii } from "../lib/upn";

describe("ASCII normalization", () => {
  it("normalizes Slovenian and accented Latin payment text", () => {
    expect(normalizeAscii("JAKŠA")).toBe("JAKSA");
    expect(normalizeAscii("ŠKOFLJICA")).toBe("SKOFLJICA");
    expect(normalizeAscii("KAČIČ")).toBe("KACIC");
    expect(normalizeAscii("MIKLOŠIČEVA")).toBe("MIKLOSICEVA");
    expect(normalizeAscii("MAŠERA SPASIĆEVA")).toBe("MASERA SPASICEVA");
  });
});
