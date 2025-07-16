import { pgTable, text, serial, integer, boolean, uuid, timestamp, decimal, jsonb, date, interval } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Profiles table (users)
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  company_id: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role").default("user").notNull(),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  company_id: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin"),
  license_plate: text("license_plate"),
  status: text("status").default("available"),
  mileage: integer("mileage"),
  last_service_date: date("last_service_date"),
  next_service_mileage: integer("next_service_mileage"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Drivers table
export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  company_id: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  license_number: text("license_number"),
  license_expiry: date("license_expiry"),
  is_active: boolean("is_active").default(true),
  user_id: uuid("user_id"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Vehicle tracking table
export const vehicle_tracking = pgTable("vehicle_tracking", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicle_id: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  speed: decimal("speed", { precision: 5, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  altitude: decimal("altitude", { precision: 7, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Trips table
export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicle_id: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  driver_id: uuid("driver_id").references(() => drivers.id, { onDelete: "set null" }),
  origin: jsonb("origin"),
  destination: jsonb("destination"),
  planned_route: jsonb("planned_route"),
  actual_route: jsonb("actual_route"),
  start_time: timestamp("start_time", { withTimezone: true }),
  end_time: timestamp("end_time", { withTimezone: true }),
  distance: decimal("distance", { precision: 8, scale: 2 }),
  duration: interval("duration"),
  status: text("status").default("planned"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  company_id: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  business_name: text("business_name"),
  contact_info: jsonb("contact_info").default("{}"),
  billing_info: jsonb("billing_info").default("{}"),
  preferences: jsonb("preferences").default("{}"),
  status: text("status").default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Maintenance records table
export const maintenance_records = pgTable("maintenance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicle_id: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  maintenance_type: text("maintenance_type"),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  service_provider: text("service_provider"),
  scheduled_date: date("scheduled_date"),
  completed_date: date("completed_date"),
  next_service_date: date("next_service_date"),
  parts_used: jsonb("parts_used").default("{}"),
  labor_hours: decimal("labor_hours", { precision: 5, scale: 2 }),
  status: text("status").default("scheduled"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Fuel records table
export const fuel_records = pgTable("fuel_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicle_id: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  driver_id: uuid("driver_id").references(() => drivers.id, { onDelete: "set null" }),
  fuel_type: text("fuel_type"),
  quantity: decimal("quantity", { precision: 8, scale: 2 }),
  cost_per_unit: decimal("cost_per_unit", { precision: 6, scale: 3 }),
  total_cost: decimal("total_cost", { precision: 10, scale: 2 }),
  odometer_reading: integer("odometer_reading"),
  location: jsonb("location"),
  receipt_url: text("receipt_url"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Insert schemas for all tables
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenance_records).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFuelRecordSchema = createInsertSchema(fuel_records).omit({
  id: true,
  created_at: true,
});

// Type exports
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type MaintenanceRecord = typeof maintenance_records.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

export type FuelRecord = typeof fuel_records.$inferSelect;
export type InsertFuelRecord = z.infer<typeof insertFuelRecordSchema>;

// Legacy user schema for backward compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
