-- SWAYARI ENTERPRISES D1 Schema Migration 0001: Initial Schema
-- Production and Local SQLite/D1 compatible

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- Google sub (stable subject identifier)
    email TEXT UNIQUE NOT NULL,                -- Verified Google email
    name TEXT NOT NULL,                        -- Profile name
    picture TEXT,                              -- Google profile avatar
    role TEXT NOT NULL DEFAULT 'customer',     -- 'admin' or 'customer'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,                       -- 64-char crypto random token
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT NOT NULL DEFAULT '[]',         -- JSON array of asset paths
    material TEXT,                             -- Confirmed material
    dimensions TEXT,                           -- Confirmed dimensions
    has_variants INTEGER DEFAULT 0,
    variants_json TEXT DEFAULT '[]',           -- JSON array of variant options
    indicative_price REAL,                     -- Nullable: null represents 'Price on Request'
    min_quantity INTEGER DEFAULT 1,
    availability_label TEXT DEFAULT 'Available on Request',
    customisation_info TEXT,
    status TEXT NOT NULL DEFAULT 'draft',      -- 'draft', 'published', 'archived'
    is_demo INTEGER DEFAULT 0,                 -- 1 indicates preview/demo data
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_demo ON products(is_demo);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                       -- Reference: SW-YYYYMMDD-XXXX
    idempotency_key TEXT UNIQUE NOT NULL,      -- Prevents duplicate submissions
    customer_id TEXT NOT NULL REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT NOT NULL,
    delivery_state TEXT NOT NULL,
    delivery_pincode TEXT NOT NULL,
    customer_notes TEXT,
    status TEXT NOT NULL DEFAULT 'new_request', -- 'new_request', 'contacted', 'quoted', 'confirmed', 'dispatched', 'completed', 'cancelled'
    initial_indicative_subtotal REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_name TEXT NOT NULL,                -- Immutable snapshot
    selected_variant TEXT,                     -- Immutable snapshot
    quantity INTEGER NOT NULL,
    snapshot_indicative_price REAL,            -- Indicative price snapshot at request time
    snapshot_image_url TEXT,
    customisation_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_quotations (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    items_quotation_json TEXT NOT NULL,        -- JSON array of agreed item prices
    items_subtotal REAL NOT NULL,
    shipping_charge REAL NOT NULL DEFAULT 0,   -- Explicit shipping quotation
    tax_amount REAL DEFAULT 0,
    total_quoted_amount REAL NOT NULL,
    quotation_notes TEXT,
    created_by_admin TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_quotations_order_id ON order_quotations(order_id);

CREATE TABLE IF NOT EXISTS order_internal_notes (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    admin_id TEXT NOT NULL REFERENCES users(id),
    admin_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_order_id ON order_internal_notes(order_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,                 -- 'order', 'product', 'category', 'auth'
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details_json TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
