import QRCode from "qrcode";
import { buildUpnPayload } from "./payload";
import type { PaymentFields } from "./types";

export async function generateUpnQr(input: PaymentFields): Promise<{ svg: string; payload: string }> {
  const built = buildUpnPayload(input);
  const svg = await QRCode.toString(built.payload, {
    type: "svg",
    version: 15,
    errorCorrectionLevel: "M",
    margin: 4,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  return { svg, payload: built.payload };
}
