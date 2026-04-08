CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT
);

INSERT INTO businesses (user_id, business_name, category, description)
VALUES 
(1, 'Discoteca MoonLight', 'Discoteca', 'Discoteca con música en vivo y reservas VIP'),
(1, 'Club Eclipse', 'Bar Nocturno', 'Bar con ambiente lounge y DJ invitados');