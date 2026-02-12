-- Schools (unchanged)
INSERT INTO schools (id, name, address, is_available) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Colegio San Agustín', 'Av. Javier Prado Este 980, San Isidro', true),
  ('22222222-2222-2222-2222-222222222222', 'Markham College', 'Augusto Angulo 291, Miraflores', true),
  ('33333333-3333-3333-3333-333333333333', 'Newton College', 'Av. Ricardo Elías Aparicio 240, La Molina', true),
  ('44444444-4444-4444-4444-444444444444', 'Lima Villa College', 'Alameda Don Alfonso 125, Chorrillos', true),
  ('55555555-5555-5555-5555-555555555555', 'Roosevelt School', 'Av. Las Palmeras 325, Camacho', true)
ON CONFLICT (id) DO NOTHING;

-- Products: 6-12 Months
INSERT INTO products (id, name, description, price, category, age_range, rating, net_weight_g, preparation, is_organic, is_gluten_free, is_new, is_available, image_url) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Puré de Calabaza', 'Suave puré rico en beta-carotenos.', 4.50, 'age_6_12', '6+ Meses', 5, 120, 'Listo para comer', true, true, false, true, 'https://images.unsplash.com/photo-1621510456681-2330135e5871?q=80&w=600&auto=format&fit=crop'),
  ('a0000002-0000-0000-0000-000000000002', 'Papilla de Pollo y Pera', 'Proteínas suaves con un toque dulce.', 5.25, 'age_6_12', '8+ Meses', 4, 150, 'Calentar ligeramente', true, true, true, true, 'https://images.unsplash.com/photo-1620917670397-a77ee2d72c1c?q=80&w=600&auto=format&fit=crop'),
  ('a0000003-0000-0000-0000-000000000003', 'Crema de Espinaca', 'Hierro y energía en textura cremosa.', 4.80, 'age_6_12', '7+ Meses', 5, 130, 'Listo para comer', true, true, false, true, 'https://images.unsplash.com/photo-1576021182211-9ea8dced3690?q=80&w=600&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, image_url = EXCLUDED.image_url;

-- Products: 1-2 Years
INSERT INTO products (id, name, description, price, category, age_range, rating, net_weight_g, preparation, is_organic, is_gluten_free, is_new, is_available, image_url) VALUES
  ('a0000004-0000-0000-0000-000000000004', 'Albóndigas de Pavo', 'Pequeños bocados con salsa casera.', 6.50, 'age_1_2', '12+ Meses', 5, 180, 'Calentar 30s', false, true, true, true, 'https://images.unsplash.com/photo-1594220551069-b52e0cf26868?q=80&w=600&auto=format&fit=crop'),
  ('a0000005-0000-0000-0000-000000000005', 'Pasta de Colores', 'Pasta con vegetales ocultos.', 6.00, 'age_1_2', '12+ Meses', 4, 200, 'Calentar 45s', true, true, false, true, 'https://plus.unsplash.com/premium_photo-1664478291780-0c67f5fb15e6?q=80&w=600&auto=format&fit=crop'),
  ('a0000006-0000-0000-0000-000000000006', 'Guiso de Lentejas', 'Hierro y fibra con arroz.', 5.80, 'age_1_2', '12+ Meses', 5, 190, 'Calentar 30s', true, true, false, true, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=600&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, image_url = EXCLUDED.image_url;

-- Products: Snacks
INSERT INTO products (id, name, description, price, category, age_range, rating, net_weight_g, preparation, is_organic, is_gluten_free, is_new, is_available, image_url) VALUES
  ('a0000007-0000-0000-0000-000000000007', 'Galletas de Avena', 'Sin azúcar, solo plátano.', 3.50, 'snack', 'All ages', 5, 50, 'Listo para comer', true, false, false, true, 'https://images.unsplash.com/photo-1499636138143-bd630f5cf386?q=80&w=600&auto=format&fit=crop'),
  ('a0000008-0000-0000-0000-000000000008', 'Bastones de Zanahoria', 'Horneados y crujientes.', 3.00, 'snack', '8+ Meses', 4, 40, 'Listo para comer', true, true, false, true, 'https://images.unsplash.com/photo-1598155523122-3842334d6c10?q=80&w=600&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, image_url = EXCLUDED.image_url;

-- Products: Drinks
INSERT INTO products (id, name, description, price, category, age_range, rating, net_weight_g, preparation, is_organic, is_gluten_free, is_new, is_available, image_url) VALUES
  ('a0000009-0000-0000-0000-000000000009', 'Jugo Verde Kids', 'Manzana, pera y espinaca.', 3.20, 'drink', '12+ Meses', 5, 250, 'Frío', true, true, false, true, 'https://images.unsplash.com/photo-1622597467836-bd0de9698947?q=80&w=600&auto=format&fit=crop'),
  ('a0000010-0000-0000-0000-000000000010', 'Leche de Almendras', 'Casera y natural.', 4.00, 'drink', '24+ Meses', 4, 250, 'Frío', true, true, true, true, 'https://images.unsplash.com/photo-1582234084366-4add5dfb908f?q=80&w=600&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, image_url = EXCLUDED.image_url;

-- Ingredients (unchanged - just re-run to be safe or if ids match)
INSERT INTO product_ingredients (product_id, name, percentage) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Calabaza', 60),
  ('a0000001-0000-0000-0000-000000000001', 'Zanahoria', 40),
  ('a0000002-0000-0000-0000-000000000002', 'Pera', 50),
  ('a0000002-0000-0000-0000-000000000002', 'Pechuga de Pollo', 30),
  ('a0000002-0000-0000-0000-000000000002', 'Agua', 20),
  ('a0000003-0000-0000-0000-000000000003', 'Papa Amarilla', 50),
  ('a0000003-0000-0000-0000-000000000003', 'Espinaca', 30),
  ('a0000003-0000-0000-0000-000000000003', 'Leche Materna/Fórmula', 20),
  ('a0000004-0000-0000-0000-000000000004', 'Pavo Molido', 70),
  ('a0000004-0000-0000-0000-000000000004', 'Tomate', 20),
  ('a0000004-0000-0000-0000-000000000004', 'Avena', 10),
  ('a0000005-0000-0000-0000-000000000005', 'Pasta de Arroz', 50),
  ('a0000005-0000-0000-0000-000000000005', 'Zucchini', 15),
  ('a0000005-0000-0000-0000-000000000005', 'Zanahoria', 15),
  ('a0000005-0000-0000-0000-000000000005', 'Pimiento', 10),
  ('a0000007-0000-0000-0000-000000000007', 'Avena', 60),
  ('a0000007-0000-0000-0000-000000000007', 'Plátano Maduro', 40)
ON CONFLICT DO NOTHING;

-- Nutritional Benefits (unchanged)
INSERT INTO product_nutritional_benefits (product_id, title, description, icon) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Visión', 'Alto en Vitamina A para el desarrollo ocular.', 'visibility'),
  ('a0000001-0000-0000-0000-000000000001', 'Digestión', 'Fibra suave para su pancita.', 'spa'),
  ('a0000002-0000-0000-0000-000000000002', 'Proteína', 'Esencial para el crecimiento muscular.', 'fitness_center'),
  ('a0000002-0000-0000-0000-000000000002', 'Dulzura Natural', 'Sin azúcares refinados.', 'mood'),
  ('a0000003-0000-0000-0000-000000000003', 'Hierro', 'Previene la anemia infantil.', 'bolt'),
  ('a0000004-0000-0000-0000-000000000004', 'Coordinación', 'Fomenta el uso de cubiertos o pinza.', 'pan_tool'),
  ('a0000005-0000-0000-0000-000000000005', 'Vitaminas', 'Mix de 5 vegetales en un solo plato.', 'local_florist'),
  ('a0000007-0000-0000-0000-000000000007', 'Energía', 'Carbohidratos complejos para jugar todo el día.', 'directions_run')
ON CONFLICT DO NOTHING;
