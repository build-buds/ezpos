## Plan: Document transactions immutability as intentional

The `transactions` table intentionally has no UPDATE or DELETE policies. Financial transaction records should be an append-only ledger — allowing edits or deletes would compromise reporting integrity, audit trails, loyalty point calculations, and subscription/usage limits (e.g. Free tier's 100 tx/month cap).

This matches standard POS/accounting practice: corrections are made via offsetting transactions (voids/refunds), not by mutating history.

### Actions

1. **Mark the finding as fixed-by-design** via `security--manage_security_finding` with `mark_as_fixed`, explaining transactions are an immutable ledger by design.
2. **Update security memory** via `security--update_memory` to record that `transactions` is intentionally append-only (no UPDATE/DELETE policies) so future scans don't re-flag it.

### No code or schema changes

No migration, no RLS changes, no frontend changes. Reports, POS, and loyalty flows already assume immutability.