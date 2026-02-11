import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  children,
  deliveryAddresses,
  orders,
  orderItems,
  products,
  productIngredients,
  productNutritionalBenefits,
} from "@/lib/db/schema";

// Product category enum for forms
export const productCategorySchema = z.enum([
  "age_6_12",
  "age_1_2",
  "snack",
  "drink",
]);

export const addressLabelSchema = z.enum(["school", "home", "office"]);

// Children
export const insertChildSchema = createInsertSchema(children, {
  name: z.string().min(1, "Nombre requerido"),
  birthDate: z.string().min(1, "Fecha de nacimiento requerida"),
  allergyIds: z.array(z.string()).default([]),
  avoidedFoods: z.array(z.string()).default([]),
}).omit({ id: true, parentId: true, createdAt: true, updatedAt: true });

export const selectChildSchema = createSelectSchema(children);

// Delivery addresses
export const insertDeliveryAddressSchema = createInsertSchema(deliveryAddresses, {
  address: z.string().min(1, "Dirección requerida"),
  label: addressLabelSchema,
}).omit({ id: true, profileId: true, createdAt: true, updatedAt: true });

export const selectDeliveryAddressSchema = createSelectSchema(deliveryAddresses);

// Products
export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1, "Nombre requerido"),
  price: z.coerce.number().min(0, "Precio debe ser positivo"),
  category: productCategorySchema,
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectProductSchema = createSelectSchema(products);

// Product ingredients
export const insertProductIngredientSchema = createInsertSchema(
  productIngredients
).omit({ id: true });

// Product nutritional benefits
export const insertProductNutritionalBenefitSchema = createInsertSchema(
  productNutritionalBenefits
).omit({ id: true });

// Orders
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Form types
export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertDeliveryAddress = z.infer<typeof insertDeliveryAddressSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
