import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  currencyPair: text("currency_pair").notNull(), // USD/KRW, JPY/KRW, USD/JPY
  targetType: text("target_type").notNull(), // 'above' or 'below'
  targetRate: decimal("target_rate", { precision: 10, scale: 4 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  wasTriggered: boolean("was_triggered").default(false).notNull(),
  alertState: text("alert_state").default("WAIT_UP").notNull(), // 'WAIT_UP' or 'WAIT_DOWN'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  currencyPair: text("currency_pair").notNull(),
  rate: decimal("rate", { precision: 10, scale: 4 }).notNull(),
  change: decimal("change", { precision: 10, scale: 4 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
}).extend({
  targetRate: z.number().or(z.string().transform(Number)),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  timestamp: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
