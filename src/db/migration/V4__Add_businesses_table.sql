CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT
);