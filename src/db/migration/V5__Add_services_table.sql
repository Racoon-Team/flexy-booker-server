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

INSERT INTO services 
(business_id, name, description, price, schedule, is_active, custom_fields)
VALUES 
(1,'Mesa VIP','Reserva de mesa VIP con botella incluida',350.00,ARRAY['Viernes 22:00','Sabado 22:00'],true,'[{"label":"Botella","type":"select","options":["Whisky","Ron","Vodka"]}]'),
(1,'Entrada General','Acceso general a la discoteca',50.00,ARRAY['Viernes 21:00','Sabado 21:00'],true,'[]');