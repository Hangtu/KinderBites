import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const addressLabelEnum = pgEnum("address_label", [
  "school",
  "home",
  "office",
]);
export const productCategoryEnum = pgEnum("product_category", [
  "age_6_12",
  "age_1_2",
  "snack",
  "drink",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "preparing",
  "delivered",
  "cancelled",
]);

// Tables
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const allergies = pgTable("allergies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
});

export const children = pgTable("children", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthDate: date("birth_date"),
  schoolName: text("school_name"),
  grade: text("grade"),
  allergyIds: text("allergy_ids").array().default([]),
  avoidedFoods: text("avoided_foods").array().default([]),
  specialNotes: text("special_notes"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const deliveryAddresses = pgTable("delivery_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  label: addressLabelEnum("label").notNull().default("school"),
  address: text("address").notNull(),
  schoolId: uuid("school_id").references(() => schools.id, { onDelete: "set null" }),
  schoolName: text("school_name"),
  preferredTimeSlot: text("preferred_time_slot"),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: productCategoryEnum("category").notNull().default("age_6_12"),
  ageRange: text("age_range"),
  rating: integer("rating").default(0),
  netWeightG: decimal("net_weight_g", { precision: 10, scale: 2 }),
  preparation: text("preparation"),
  isOrganic: boolean("is_organic").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isNew: boolean("is_new").default(false),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const productIngredients = pgTable("product_ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  percentage: integer("percentage"),
});

export const productNutritionalBenefits = pgTable(
  "product_nutritional_benefits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    icon: text("icon"),
  }
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  deliveryAddressId: uuid("delivery_address_id").references(
    () => deliveryAddresses.id,
    { onDelete: "set null" }
  ),
  deliveryDate: date("delivery_date"),
  deliveryTimeSlot: text("delivery_time_slot"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  subscriptionDiscount: decimal("subscription_discount", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  isSubscription: boolean("is_subscription").default(false),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  specificNotes: text("specific_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
