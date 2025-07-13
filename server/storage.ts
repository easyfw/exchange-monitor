import { users, alerts, exchangeRates, settings, type User, type InsertUser, type Alert, type InsertAlert, type ExchangeRate, type InsertExchangeRate, type Setting, type InsertSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;
  markAlertTriggered(id: number): Promise<void>;
  resetAlertTrigger(id: number): Promise<void>;
  updateAlertState(id: number, state: string): Promise<void>;
  
  // Exchange rate operations
  createExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;
  getLatestRates(): Promise<ExchangeRate[]>;
  getRateHistory(currencyPair: string, limit: number): Promise<ExchangeRate[]>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values({
        ...insertAlert,
        isActive: insertAlert.isActive ?? true,
      })
      .returning();
    return alert;
  }

  async getAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .orderBy((table) => table.createdAt);
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.isActive, true))
      .orderBy((table) => table.createdAt);
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db
      .delete(alerts)
      .where(eq(alerts.id, id));
    return result.rowCount > 0;
  }

  async markAlertTriggered(id: number): Promise<void> {
    await db.update(alerts)
      .set({ 
        wasTriggered: true, 
        lastTriggered: new Date() 
      })
      .where(eq(alerts.id, id));
  }

  async resetAlertTrigger(id: number): Promise<void> {
    await db.update(alerts)
      .set({ wasTriggered: false })
      .where(eq(alerts.id, id));
  }

  async updateAlertState(id: number, state: string): Promise<void> {
    await db.update(alerts)
      .set({ alertState: state })
      .where(eq(alerts.id, id));
  }

  async createExchangeRate(insertRate: InsertExchangeRate): Promise<ExchangeRate> {
    const [rate] = await db
      .insert(exchangeRates)
      .values(insertRate)
      .returning();
    return rate;
  }

  async getLatestRates(): Promise<ExchangeRate[]> {
    // Get the latest rate for each currency pair
    const latestRates = await db
      .select()
      .from(exchangeRates)
      .orderBy((table) => table.timestamp);
    
    const ratesByPair = new Map<string, ExchangeRate>();
    latestRates.reverse().forEach(rate => {
      if (!ratesByPair.has(rate.currencyPair)) {
        ratesByPair.set(rate.currencyPair, rate);
      }
    });
    
    return Array.from(ratesByPair.values());
  }

  async getRateHistory(currencyPair: string, limit: number = 20): Promise<ExchangeRate[]> {
    return await db
      .select()
      .from(exchangeRates)
      .where(eq(exchangeRates.currencyPair, currencyPair))
      .orderBy(desc(exchangeRates.timestamp))
      .limit(limit);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(insertSetting.key);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: insertSetting.value, updatedAt: new Date() })
        .where(eq(settings.key, insertSetting.key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values(insertSetting)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
