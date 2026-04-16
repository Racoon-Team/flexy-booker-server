DELETE FROM services;
DELETE FROM businesses;
DELETE FROM users;

ALTER SEQUENCE users_id_seq RESTART WITH 1;

INSERT INTO users 
(id, name, email, password, user_type, address, phone_number)
VALUES 
(
  1,
  'Admin',
  'test@email.com',
  '$2b$10$hkqnLbUOnzOn9nq2hOgHo.fFQiNobzs.rcWyo4zBqyKkyTr.W/Nx.',
  'empresa',
  'N/A',
  '00000000'
);