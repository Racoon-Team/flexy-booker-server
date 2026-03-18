CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO todos (title) VALUES
('Learn Node.js'),
('Build Todo API'),
('Study TypeScript'),
('Write Knex migrations'),
('Deploy backend');