# SWAYARI ENTERPRISES — System Architecture

## 1. System Overview

SWAYARI ENTERPRISES is built upon a **free-first, edge-native, zero-bloat architecture** using Cloudflare Pages, Cloudflare Pages Functions, and Cloudflare D1.

```mermaid
graph TD
    Client["Client Web Browser<br/>(Desktop / Mobile)"]
    CFPages["Cloudflare Pages CDN<br/>(Static HTML, Modern CSS, ES Modules)"]
    CFFunc["Cloudflare Pages Functions<br/>(/functions/api/*)"]
    D1["Cloudflare D1 Database<br/>(Serverless SQLite)"]
    GoogleAuth["Google Identity Services<br/>(OAuth 2.0 Web ID Token)"]
    Admin["SWAYARI Team<br/>(swayarienterprises@gmail.com)"]

    Client -->|Static Assets| CFPages
    Client -->|Sign In with Google| GoogleAuth
    Client -->|ID Token / Cookies| CFFunc
    CFFunc -->|Remote JWKS Verify| GoogleAuth
    CFFunc -->|Parameterized Queries & Batches| D1
    Admin -->|Admin Dashboard / Quotation Revisions| CFFunc
```

---

## 2. The Catalogue & Order Request Model

### Why No Automated Online Payment Checkout?
1. **Artisanal Devotional Art:** Products are silver-plated framed plaques and heavy bell-metal brassware. Unit weights, frame mouldings, and dimensions vary.
2. **Fragile Transit Protection:** Shipping charges cannot be generalized. Packing fragile devotional art requires multi-layer foam, timber reinforcement, and destination-specific transit insurance.
3. **Customisation:** Customers frequently request custom engraved name plaques, velvet gift wrap, or ceremonial wedding notes.
4. **Mandatory Process Notice:**
   > *“Our team will contact you to confirm availability, final pricing, shipping charges and delivery details. Submitting this request does not confirm a purchase or reserve stock.”*

### Customer Journey Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Browser as Client Browser
    participant API as Pages Functions
    participant D1 as Cloudflare D1
    actor Team as SWAYARI Team

    Customer->>Browser: Browses catalogue (Unauthenticated)
    Customer->>Browser: Clicks "Add to Request"
    Browser->>Customer: Opens Google Sign-in Modal
    Customer->>Browser: Completes Google Sign-in
    Browser->>API: POST /api/auth/google (ID Token)
    API->>D1: Verify token & establish Session (HttpOnly Cookie)
    API-->>Browser: Session Established
    Browser->>Browser: Automatically resumes Add to Request
    Customer->>Browser: Enters Phone, Delivery Address & Submits
    Browser->>API: POST /api/orders (Idempotency Key, Items, Address)
    API->>D1: Atomically save Order & Items (DB.batch)
    API-->>Browser: Returns Order Reference (SW-YYYYMMDD-XXXX)
    Browser->>Customer: Displays Confirmation & Next Steps
    Team->>D1: Views new request in Admin Panel
    Team->>Customer: Direct Telephone / WhatsApp Consultation
    Team->>D1: Issues Quotation Revision (Items + Shipping)
    Customer->>Browser: Reviews Quotation in Account Dashboard
```

---

## 3. Database Schema (D1)

The database schema is strictly versioned under `migrations/`:

### Core Tables
1. **`users`**: Stores stable Google subject identifier (`sub`), verified email, name, avatar, and assigned role (`'customer'` or `'admin'`).
2. **`sessions`**: 256-bit cryptographically random tokens with explicit 14-day expiry.
3. **`categories`**: Product classifications with display ordering and active toggles.
4. **`products`**: Catalogue items including SKU, URL slug, dimensions, confirmed material, indicative price (nullable for "Price on Request"), minimum quantity, status (`'draft'`, `'published'`, `'archived'`), and demo flag (`is_demo = 1`).
5. **`orders`**: Customer order requests with unique `idempotency_key`, contact phone, shipping destination, initial indicative subtotal, and status.
6. **`order_items`**: Immutable snapshot of product SKU, name, indicative price, quantity, and customisation note taken at the exact moment of request submission.
7. **`order_quotations`**: Versioned formal quotations issued by the admin team. Contains agreed item unit prices, insured shipping charge, applicable taxes, and consultation notes.
8. **`order_internal_notes`**: Confidential administrative notes entered during telephone calls. **Completely isolated and omitted from customer APIs.**
9. **`audit_logs`**: Chronological record of status changes, quotation issuances, product edits, and logins.

---

## 4. Order Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> New_Request: Customer submits request
    New_Request --> Contacted: Team completes phone consultation
    Contacted --> Quoted: Team issues Quotation Revision
    Quoted --> Confirmed: Customer approves & confirms order
    Confirmed --> Dispatched: Insured parcel handed to courier
    Dispatched --> Completed: Customer receives parcel
    New_Request --> Cancelled: Mutual cancellation
    Contacted --> Cancelled: Mutual cancellation
    Quoted --> Cancelled: Mutual cancellation
```

---

## 5. Security & Isolation Controls

1. **Customer Data Isolation:** Every customer query for `/api/orders/:id` enforces `order.customer_id === session.user.id`. Customer B cannot view Customer A's orders.
2. **Internal Note Protection:** The `order_internal_notes` table is queried only in `/api/admin/orders/:id` behind `requireAdmin`.
3. **Re-calculating Prices:** The client browser never supplies final prices. The server re-reads indicative prices from the database at the time of request submission.
4. **Idempotency Protection:** Submissions include a client-generated `idempotencyKey`. If a customer double-clicks or retries, the server returns the existing order reference rather than duplicating rows.
5. **Google ID Token RFC Compliance:** Verified using `jose` with Google's JWKS (`https://www.googleapis.com/oauth2/v3/certs`), validating signature, expiration, issuer, audience (`GOOGLE_CLIENT_ID`), and `email_verified`.
