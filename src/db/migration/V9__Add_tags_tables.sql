CREATE TABLE tags (
  id         uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text  NOT NULL,
  slug       text  NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE category_tags (
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tag_id       uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, tag_id)
);

CREATE INDEX idx_category_tags_category ON category_tags(category_id);
CREATE INDEX idx_tags_name ON tags(name text_pattern_ops);

-- Unique case-insensitive for name
CREATE UNIQUE INDEX idx_tags_name_lower ON tags(LOWER(name));