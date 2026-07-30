# UPN QR Generator

Small local Next.js app for creating Slovenian UPN QR payment codes.

## Run

```bash
npm install
npm run dev -- --port 3000
```

Open http://localhost:3000.

## Test

```bash
npm test
npm run build
```

## Architecture

- Phase 1 is manual entry only: editable payment form, validation, deterministic UPN payload generation and large QR display.
- UPN banking logic is isolated under `lib/upn/`.
- React components do not construct banking payloads directly.

Textual UPN fields are normalized to ASCII for compatibility. Structured values such as IBAN, amount and references are validated and formatted without accent transliteration.
