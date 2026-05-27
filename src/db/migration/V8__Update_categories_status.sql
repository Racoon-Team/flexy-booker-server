-- 1. Crear el tipo enum
CREATE TYPE category_status AS ENUM ('active', 'pending', 'archived');

-- 2. Agregar la nueva columna con valor derivado del campo anterior
ALTER TABLE categories
  ADD COLUMN status category_status NOT NULL DEFAULT 'active';

UPDATE categories
SET status = CASE
  WHEN is_active THEN 'active'::category_status
  ELSE 'archived'::category_status
END;

-- 3. Eliminar la columna vieja
ALTER TABLE categories DROP COLUMN is_active;

-- 4. Índice para filtrar por status eficientemente
CREATE INDEX idx_categories_status ON categories(status);