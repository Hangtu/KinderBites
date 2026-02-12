-- Schools con disponibilidad de entrega (solo estas se pueden seleccionar)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Lectura pública para listar escuelas disponibles
CREATE POLICY "Anyone can read available schools"
  ON schools FOR SELECT
  USING (is_available = true);

-- Los inserts/updates se harán vía service_role o desde Supabase Studio

CREATE INDEX idx_schools_is_available ON schools(is_available);

-- Agregar school_id a delivery_addresses para referenciar cuando label='school'
ALTER TABLE delivery_addresses
  ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

CREATE INDEX idx_delivery_addresses_school ON delivery_addresses(school_id);

-- Insertar escuelas de ejemplo (edita/agrega más desde Supabase Studio)
INSERT INTO schools (name, address, is_available) VALUES
  ('Guardería Mis Primeros Pasos', 'Av. Principal 123, Col. Centro', true),
  ('Colegio San José', 'Calle Juárez 456, Centro', true),
  ('Kindercare Montessori', 'Av. Reforma 789, Zona Norte', true);
