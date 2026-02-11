-- Lonchi Web - Initial Schema
-- Fresh schema for school lunch ordering app

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES (linked to auth.users)
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- ALLERGIES (catalog)
-- =============================================================================

CREATE TABLE allergies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT
);

INSERT INTO allergies (id, name, icon) VALUES
  ('gluten', 'Gluten', 'grain'),
  ('dairy', 'Lácteos', 'water_drop'),
  ('egg', 'Huevo', 'egg'),
  ('peanut', 'Maní', 'eco'),
  ('fish', 'Pescado', 'set_meal'),
  ('soy', 'Soja', 'category');

-- =============================================================================
-- CHILDREN
-- =============================================================================

CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  school_name TEXT,
  grade TEXT,
  allergy_ids TEXT[] DEFAULT '{}',
  avoided_foods TEXT[] DEFAULT '{}',
  special_notes TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children"
  ON children FOR ALL
  USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);

CREATE INDEX idx_children_parent_id ON children(parent_id);

-- =============================================================================
-- DELIVERY ADDRESSES
-- =============================================================================

CREATE TYPE address_label AS ENUM ('school', 'home', 'office');

CREATE TABLE delivery_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label address_label NOT NULL DEFAULT 'school',
  address TEXT NOT NULL,
  school_name TEXT,
  preferred_time_slot TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their addresses"
  ON delivery_addresses FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE INDEX idx_delivery_addresses_profile ON delivery_addresses(profile_id);

-- =============================================================================
-- PRODUCTS
-- =============================================================================

CREATE TYPE product_category AS ENUM ('age_6_12', 'age_1_2', 'snack', 'drink');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category product_category NOT NULL DEFAULT 'age_6_12',
  age_range TEXT,
  rating INTEGER DEFAULT 0,
  net_weight_g DECIMAL(10, 2),
  preparation TEXT,
  is_organic BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT USING (is_available = TRUE);

-- Products: public read for available; admin write via service role (no RLS policy for insert/update)

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);

-- =============================================================================
-- PRODUCT INGREDIENTS
-- =============================================================================

CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  percentage INTEGER
);

ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product ingredients follow product visibility"
  ON product_ingredients FOR SELECT
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_available = TRUE));

-- =============================================================================
-- PRODUCT NUTRITIONAL BENEFITS
-- =============================================================================

CREATE TABLE product_nutritional_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

ALTER TABLE product_nutritional_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritional benefits follow product visibility"
  ON product_nutritional_benefits FOR SELECT
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_available = TRUE));

-- =============================================================================
-- ORDERS
-- =============================================================================

CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'delivered', 'cancelled');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  delivery_date DATE,
  delivery_time_slot TEXT,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subscription_discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  is_subscription BOOLEAN DEFAULT FALSE,
  status order_status DEFAULT 'pending' NOT NULL,
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their orders"
  ON orders FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update pending orders"
  ON orders FOR UPDATE USING (auth.uid() = parent_id AND status = 'pending');

CREATE INDEX idx_orders_parent_id ON orders(parent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =============================================================================
-- ORDER ITEMS
-- =============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  specific_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view order items"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.parent_id = auth.uid()));

CREATE POLICY "Parents can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.parent_id = auth.uid()));

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_child_id ON order_items(child_id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_addresses_updated_at
  BEFORE UPDATE ON delivery_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
