-- ============================================================
-- V7 — Replace schema with flexy-booker v1.0
-- ============================================================

-- Drop old tables (child → parent)
DROP TABLE IF EXISTS todos            CASCADE;
DROP TABLE IF EXISTS audit_log        CASCADE;
DROP TABLE IF EXISTS sessions         CASCADE;
DROP TABLE IF EXISTS reports          CASCADE;
DROP TABLE IF EXISTS bookings         CASCADE;
DROP TABLE IF EXISTS messages         CASCADE;
DROP TABLE IF EXISTS conversations    CASCADE;
DROP TABLE IF EXISTS favorites        CASCADE;
DROP TABLE IF EXISTS services         CASCADE;
DROP TABLE IF EXISTS business_photos  CASCADE;
DROP TABLE IF EXISTS businesses       CASCADE;
DROP TABLE IF EXISTS categories       CASCADE;
DROP TABLE IF EXISTS users            CASCADE;
DROP TABLE IF EXISTS cities           CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS check_subcategory_parent() CASCADE;
DROP FUNCTION IF EXISTS touch_updated_at()         CASCADE;
DROP FUNCTION IF EXISTS sync_last_message_at()     CASCADE;
DROP FUNCTION IF EXISTS promote_to_owner()         CASCADE;

-- Drop old enums (from original schema and any stragglers)
DROP TYPE IF EXISTS audit_target    CASCADE;
DROP TYPE IF EXISTS report_status   CASCADE;
DROP TYPE IF EXISTS report_reason   CASCADE;
DROP TYPE IF EXISTS report_target   CASCADE;
DROP TYPE IF EXISTS booking_status  CASCADE;
DROP TYPE IF EXISTS service_status  CASCADE;
DROP TYPE IF EXISTS business_status CASCADE;
DROP TYPE IF EXISTS user_status     CASCADE;
DROP TYPE IF EXISTS user_role       CASCADE;

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================
-- Enums
-- ============================================================
CREATE TYPE user_role        AS ENUM ('client', 'owner', 'admin');
CREATE TYPE user_status      AS ENUM ('pending', 'active', 'suspended', 'deleted');
CREATE TYPE business_status  AS ENUM ('draft', 'pending', 'active', 'suspended', 'deleted');
CREATE TYPE service_status   AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE booking_status   AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE report_target    AS ENUM ('user', 'business', 'message');
CREATE TYPE report_reason    AS ENUM ('spam', 'abuse', 'fake', 'inappropriate', 'fraud', 'other');
CREATE TYPE report_status    AS ENUM ('open', 'in_review', 'resolved', 'dismissed');
CREATE TYPE audit_target     AS ENUM ('user', 'business', 'service', 'category', 'report');

-- ============================================================
-- Identity domain
-- ============================================================
CREATE TABLE cities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  country      text        NOT NULL DEFAULT 'BO',
  region       text,
  lat          numeric(9,6),
  lng          numeric(9,6),
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, country)
);

CREATE TABLE users (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext      NOT NULL UNIQUE,
  password_hash   text,
  first_name      text        NOT NULL,
  last_name       text,
  phone           text,
  avatar_url      text,
  role            user_role   NOT NULL DEFAULT 'client',
  status          user_status NOT NULL DEFAULT 'pending',
  city_id         uuid        REFERENCES cities(id) ON DELETE SET NULL,
  email_verified  boolean     NOT NULL DEFAULT false,
  phone_verified  boolean     NOT NULL DEFAULT false,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_role_status_idx ON users (role, status);
CREATE INDEX users_city_idx        ON users (city_id);

-- ============================================================
-- Catalog domain
-- ============================================================
CREATE TABLE categories (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    uuid        REFERENCES categories(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  icon         text,
  description  text,
  sort_order   int         NOT NULL DEFAULT 0,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX categories_parent_idx ON categories (parent_id);

CREATE TABLE businesses (
  id              uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid             NOT NULL REFERENCES users(id)      ON DELETE RESTRICT,
  category_id     uuid             NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id  uuid             REFERENCES categories(id)          ON DELETE SET NULL,
  city_id         uuid             NOT NULL REFERENCES cities(id)     ON DELETE RESTRICT,
  name            text             NOT NULL,
  slug            text             NOT NULL UNIQUE,
  description     text,
  address         text,
  lat             numeric(9,6),
  lng             numeric(9,6),
  phone           text,
  email           citext,
  website         text,
  status          business_status  NOT NULL DEFAULT 'pending',
  is_verified     boolean          NOT NULL DEFAULT false,
  created_at      timestamptz      NOT NULL DEFAULT now(),
  updated_at      timestamptz      NOT NULL DEFAULT now()
);
CREATE INDEX businesses_owner_idx       ON businesses (owner_id);
CREATE INDEX businesses_category_idx    ON businesses (category_id, subcategory_id);
CREATE INDEX businesses_city_idx        ON businesses (city_id);
CREATE INDEX businesses_status_idx      ON businesses (status) WHERE status = 'active';

CREATE OR REPLACE FUNCTION check_subcategory_parent() RETURNS trigger AS $$
BEGIN
  IF NEW.subcategory_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM categories
       WHERE id = NEW.subcategory_id
         AND parent_id = NEW.category_id
    ) THEN
      RAISE EXCEPTION 'subcategory_id % is not a child of category_id %',
        NEW.subcategory_id, NEW.category_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_businesses_subcategory_check
BEFORE INSERT OR UPDATE OF category_id, subcategory_id ON businesses
FOR EACH ROW EXECUTE FUNCTION check_subcategory_parent();

CREATE TABLE business_photos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  caption      text,
  sort_order   int         NOT NULL DEFAULT 0,
  is_primary   boolean     NOT NULL DEFAULT false,
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX business_photos_biz_idx ON business_photos (business_id, sort_order);

CREATE TABLE services (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name              text           NOT NULL,
  description       text,
  price_min         numeric(10,2)  NOT NULL,
  price_max         numeric(10,2),
  currency          char(3)        NOT NULL DEFAULT 'BOB',
  duration_min      int,
  requires_booking  boolean        NOT NULL DEFAULT false,
  photo_url         text,
  status            service_status NOT NULL DEFAULT 'draft',
  created_at        timestamptz    NOT NULL DEFAULT now(),
  updated_at        timestamptz    NOT NULL DEFAULT now(),
  CHECK (price_max IS NULL OR price_max >= price_min)
);
CREATE INDEX services_biz_status_idx ON services (business_id, status);

-- ============================================================
-- Engagement domain
-- ============================================================
CREATE TABLE favorites (
  user_id      uuid        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  business_id  uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, business_id)
);
CREATE INDEX favorites_biz_idx ON favorites (business_id);

CREATE TABLE conversations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  business_id      uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  last_message_at  timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id)
);
CREATE INDEX conversations_biz_idx  ON conversations (business_id, last_message_at DESC);
CREATE INDEX conversations_user_idx ON conversations (user_id, last_message_at DESC);

CREATE TABLE messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        uuid        REFERENCES users(id) ON DELETE SET NULL,
  body             text        NOT NULL,
  read_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at);
CREATE INDEX messages_unread_idx       ON messages (conversation_id) WHERE read_at IS NULL;

CREATE TABLE bookings (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id       uuid           NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  service_id    uuid           NOT NULL REFERENCES services(id)   ON DELETE RESTRICT,
  scheduled_at  timestamptz    NOT NULL,
  duration_min  int,
  status        booking_status NOT NULL DEFAULT 'pending',
  price         numeric(10,2)  NOT NULL,
  currency      char(3)        NOT NULL DEFAULT 'BOB',
  notes         text,
  created_at    timestamptz    NOT NULL DEFAULT now(),
  updated_at    timestamptz    NOT NULL DEFAULT now()
);
CREATE INDEX bookings_biz_idx       ON bookings (business_id, scheduled_at);
CREATE INDEX bookings_user_idx      ON bookings (user_id, scheduled_at DESC);
CREATE INDEX bookings_scheduled_idx ON bookings (scheduled_at) WHERE status IN ('pending', 'confirmed');

-- ============================================================
-- Moderation & audit domain
-- ============================================================
CREATE TABLE reports (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid          REFERENCES users(id) ON DELETE SET NULL,
  target_type   report_target NOT NULL,
  target_id     uuid          NOT NULL,
  reason        report_reason NOT NULL,
  details       text,
  status        report_status NOT NULL DEFAULT 'open',
  resolved_by   uuid          REFERENCES users(id) ON DELETE SET NULL,
  resolved_at   timestamptz,
  resolution_note text,
  created_at    timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX reports_target_idx ON reports (target_type, target_id);
CREATE INDEX reports_status_idx ON reports (status, created_at DESC) WHERE status IN ('open', 'in_review');

CREATE TABLE audit_log (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      uuid         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action        text         NOT NULL,
  target_type   audit_target NOT NULL,
  target_id     uuid         NOT NULL,
  before        jsonb,
  after         jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX audit_admin_idx   ON audit_log (admin_id, created_at DESC);
CREATE INDEX audit_target_idx  ON audit_log (target_type, target_id);
CREATE INDEX audit_created_idx ON audit_log (created_at DESC);

CREATE TABLE sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text        NOT NULL UNIQUE,
  user_agent  text,
  ip_address  inet,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz
);
CREATE INDEX sessions_user_active_idx ON sessions (user_id)    WHERE revoked_at IS NULL;
CREATE INDEX sessions_expires_idx     ON sessions (expires_at) WHERE revoked_at IS NULL;

-- ============================================================
-- Triggers — updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON users      FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_businesses_updated BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_services_updated   BEFORE UPDATE ON services   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_bookings_updated   BEFORE UPDATE ON bookings   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- Trigger — sync conversations.last_message_at
-- ============================================================
CREATE OR REPLACE FUNCTION sync_last_message_at() RETURNS trigger AS $$
BEGIN
  UPDATE conversations
     SET last_message_at = NEW.created_at
   WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_sync_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION sync_last_message_at();

-- ============================================================
-- Trigger — auto-promote client → owner on first business
-- ============================================================
CREATE OR REPLACE FUNCTION promote_to_owner() RETURNS trigger AS $$
BEGIN
  UPDATE users
     SET role = 'owner'
   WHERE id = NEW.owner_id
     AND role = 'client';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_business_promote_owner
AFTER INSERT ON businesses
FOR EACH ROW EXECUTE FUNCTION promote_to_owner();

-- ============================================================
-- Seed — cities and categories
-- ============================================================
INSERT INTO cities (name, country, region, lat, lng) VALUES
  ('La Paz',     'BO', 'La Paz',     -16.5000, -68.1500),
  ('Santa Cruz', 'BO', 'Santa Cruz', -17.7833, -63.1822),
  ('Cochabamba', 'BO', 'Cochabamba', -17.3895, -66.1568),
  ('Sucre',      'BO', 'Chuquisaca', -19.0333, -65.2627),
  ('El Alto',    'BO', 'La Paz',     -16.5040, -68.1620);

WITH parent AS (
  INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Reparación',            'reparacion',         '⚡', 1),
    ('Hogar & mantenimiento', 'hogar-mantenimiento','🔧', 2),
    ('Belleza & bienestar',   'belleza',            '✂️', 3),
    ('Salud',                 'salud',              '⚕️', 4),
    ('Mascotas',              'mascotas',           '🐾', 5),
    ('Educación',             'educacion',          '📚', 6)
  RETURNING id, slug
)
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, sub.name, sub.slug, sub.so
FROM parent p
JOIN (VALUES
    ('reparacion',          'Electrónica & móviles',  'electronica-moviles', 1),
    ('reparacion',          'Electrodomésticos',       'electrodomesticos',   2),
    ('reparacion',          'Consolas & gaming',       'consolas',            3),
    ('hogar-mantenimiento', 'Plomería',                'plomeria',            1),
    ('hogar-mantenimiento', 'Electricidad',            'electricidad',        2),
    ('belleza',             'Peluquería',              'peluqueria',          1),
    ('belleza',             'Uñas',                    'unas',                2),
    ('salud',               'Fisioterapia',            'fisioterapia',        1),
    ('mascotas',            'Veterinaria a domicilio', 'vet-domicilio',       1),
    ('educacion',           'Tutorías escolares',      'tutorias',            1)
  ) AS sub(parent_slug, name, slug, so)
ON sub.parent_slug = p.slug;
