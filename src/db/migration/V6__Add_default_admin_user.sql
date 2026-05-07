-- Default admin user is created at runtime via the seed-admin script.
-- Run: yarn db:seed-admin (requires ADMIN_EMAIL and ADMIN_PASSWORD in .env)
DELETE FROM users WHERE id = 2;
