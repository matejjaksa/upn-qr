import { describe, expect, it } from "vitest";
import { formatIbanForDisplay, normalizeIban, repairSlovenianIban, validateIban } from "../lib/upn";

describe("IBAN", () => {
  it("normalizes spaces and validates the checksum", () => {
    expect(normalizeIban("SI56 0475 0000 2256 950")).toBe("SI56047500002256950");
    expect(validateIban("SI56 0475 0000 2256 950")).toBe(true);
    expect(validateIban("SI56 0475 0000 2256 951")).toBe(false);
  });

  it("repairs Slovenian TRR-style account numbers when possible", () => {
    expect(repairSlovenianIban("SI56 02086-0016907125")).toBe("SI56020860016907125");
    expect(normalizeIban("SI56 02086-0016907125")).toBe("SI56020860016907125");
    expect(validateIban("SI56 02086-0016907125")).toBe(true);
    expect(formatIbanForDisplay("SI56 02086-0016907125")).toBe("SI56 0208 6001 6907 125");
  });
});
