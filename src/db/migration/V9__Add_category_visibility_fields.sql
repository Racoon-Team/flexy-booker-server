ALTER TABLE categories
  ADD COLUMN show_on_homepage      boolean NOT NULL DEFAULT false,
  ADD COLUMN show_in_search        boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_new_businesses  boolean NOT NULL DEFAULT true,
  ADD COLUMN featured_on_homepage  boolean NOT NULL DEFAULT false;