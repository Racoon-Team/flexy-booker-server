DELETE FROM users 
WHERE id = 2;

UPDATE users
SET 
  name = 'Admin',
  email = 'test@email.com',
  password = '$2b$10$hkqnLbUOnzOn9nq2hOgHo.fFQiNobzs.rcWyo4zBqyKkyTr.W/Nx.',
  user_type = 'empresa',
  address = 'N/A',
  phone_number = '00000000'
WHERE id = 1;