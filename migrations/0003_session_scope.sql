-- SWAYARI ENTERPRISES D1 Schema Migration 0003: Session Scope Isolation
-- Separates customer sessions from admin sessions at the database level.
-- Backward compatible: existing sessions default to 'customer'.

ALTER TABLE sessions ADD COLUMN scope TEXT NOT NULL DEFAULT 'customer';
CREATE INDEX IF NOT EXISTS idx_sessions_scope ON sessions(scope);
