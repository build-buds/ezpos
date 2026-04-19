

## Root Cause
DOKU rejects every signature because `DOKU_SECRET_KEY` holds the wrong credential type:
- Current value prefix: `doku_key_...` (49 chars) → this is the **Public Key / SDK Key** (used by frontend Jokul JS widget)
- Required: **Secret Key** from Dashboard → Integrations → **API Keys** (used for HMAC-SHA256 server signature)

The signing algorithm in `create-doku-checkout/index.ts` is correct (verified against DOKU non-SNAP signature spec: `Client-Id` + `Request-Id` + `Request-Timestamp` + `Request-Target` + `Digest`, joined by `\n`, signed HMAC-SHA256, base64). No code change needed — only the secret value.

## Fix Plan

**Step 1 — User retrieves correct Secret Key from DOKU Sandbox**
1. Login to https://sandbox.doku.com
2. Sidebar → **Integrations** → **API Keys**
3. Look for the row labeled **"Secret Key"** (NOT "Public Key" / NOT "SDK Key" / NOT "Jokul Key")
4. Copy the full string — it should look like a long random alphanumeric (often 40-64 chars), and crucially it should **NOT** start with `doku_key_`
5. Also copy the **Client ID** while you're there (looks like `BRN-XXXX-XXXXXXXXXXX`) to make sure both come from the same row/product

**Step 2 — Update the secret in Lovable Cloud**
After plan approval, I will:
1. Use the secrets tool to ask you to paste the correct `DOKU_SECRET_KEY`
2. Optionally re-confirm `DOKU_CLIENT_ID` to ensure both are from the same Checkout product row
3. No edge function code changes required (signature algorithm is already correct per DOKU spec)
4. No redeploy needed (secrets are read at runtime)

**Step 3 — Re-test**
1. You click "Upgrade ke Pro" → DOKU button on `/pricing`
2. I'll check `create-doku-checkout` logs:
   - Verify `secretKeyPrefix` is no longer `doku_key`
   - Verify response is 200 with a payment URL
3. If signature is valid, you'll be redirected to DOKU sandbox payment page
4. Continue end-to-end test with payment simulator → webhook → subscription update

## What If Dashboard Only Shows "doku_key_..." Style Keys?

If the only credential available in your DOKU sandbox dashboard is the `doku_key_...` format, that means your account is provisioned for the **Jokul Checkout JS / Frontend SDK** product, not the **Server-side Checkout API** (`/checkout/v1/payment`). In that case we have two options:
- **(A)** Contact DOKU support to enable the **Checkout API** product on your sandbox account → unlocks proper Client ID + Secret Key pair
- **(B)** Pivot the integration to use the **Jokul Checkout JS widget** on the frontend instead of server-to-server API calls (a bigger refactor)

I recommend trying **(A)** first since the rest of the integration is already built for the server-side flow.

## Summary
No code changes. Just need the correct `DOKU_SECRET_KEY` value. After approval I'll request the new secret value via the secrets tool, then we re-test immediately.

