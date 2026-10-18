# SWAYARI ENTERPRISES — Security & Privacy Architecture

## 1. Authentication & Google Identity Services

SWAYARI uses direct Google Identity Services (GIS) for customer and administrative authentication, minimizing exposure to credentials.

### Backend ID Token Verification
In `functions/api/auth/google.js`:
- Handled using the maintained `jose` library via native Web Crypto API.
- Google JWKS (`https://www.googleapis.com/oauth2/v3/certs`) is fetched and cached automatically with `Cache-Control` max-age and cooldown duration.
- Validates:
  1. **Signature:** Cryptographically checked against Google's published RSA public keys.
  2. **Issuer:** Enforced to be `https://accounts.google.com` or `accounts.google.com`.
  3. **Audience:** Enforced to match `env.GOOGLE_CLIENT_ID`.
  4. **Expiry:** Standard timestamp expiration (`exp`) check.
  5. **Verified Email:** Rejects tokens where `payload.email_verified !== true`.

---

## 2. Session Management

- **Storage:** Sessions are created in the D1 `sessions` table using 32-byte (256-bit) cryptographically random hexadecimal identifiers (`crypto.getRandomValues`).
- **Cookies:** Transmitted via the `Set-Cookie` header with flags:
  - `HttpOnly`: Client-side JavaScript cannot read the session cookie (mitigating XSS extraction).
  - `Secure`: Transmitted only over HTTPS.
  - `SameSite=Lax`: Defends against Cross-Site Request Forgery (CSRF).
  - `Max-Age=1209600`: Explicit 14-day expiration.
- **Zero LocalStorage Tokens:** Authentication tokens and session IDs are **NEVER stored in browser localStorage**.

---

## 3. Access Control & Authorization

- **Customer Isolation:** In `/api/orders/:id`, the server verifies `order.customer_id === session.user.id`. A customer can never view another customer's orders.
- **Admin Gating:** All `/api/admin/*` endpoints invoke `requireAdmin()`. Non-administrative sessions receive HTTP 403 Forbidden.
- **Allowlist Bootstrap:** Administrator status is determined strictly by the server-side allowlist (`swayarienterprises@gmail.com` and `ADMIN_EMAILS`). A frontend claim or self-submitted role is never honored.

---

## 4. Order Integrity & Price Protection

- **No Client Price Trust:** Clients can only submit `{ productId, quantity, variantId }`.
- **Database Snapshot:** The server re-reads indicative prices from the database at request time and calculates the indicative subtotal. Client-forged prices are completely ignored.
- **Idempotency Token:** Submissions include a unique `idempotencyKey`. Duplicate requests return the original order reference without inserting duplicate rows.

---

## 5. Middleware & Security Headers

In `functions/_middleware.js`:
- **CSRF / Origin Check:** State-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`) verify that the `Origin` header matches the request host.
- **Content-Security-Policy (CSP):** Restricts script execution to same-origin and Google Identity Services (`https://accounts.google.com/gsi/client`).
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `SAMEORIGIN`
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** `camera=(), microphone=(), geolocation=()`

---

## 6. Audit Logging & Sanitization

- Sensitive customer payloads, full card details (which are never processed), and authorization tokens are excluded from server logs.
- Key state changes (logins, order creations, quotation issuances, and product updates) are immutably logged to `audit_logs` with timestamps and user identifiers.
