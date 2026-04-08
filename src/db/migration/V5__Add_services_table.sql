CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL,
    schedule TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    custom_fields JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);