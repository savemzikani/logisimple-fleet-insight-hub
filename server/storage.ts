import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  users, 
  companies, 
  profiles, 
  vehicles, 
  drivers,
  type User, 
  type InsertUser,
  type Company,
  type InsertCompany,
  type Profile,
  type InsertProfile,
  type Vehicle,
  type InsertVehicle,
  type Driver,
  type InsertDriver
} from "@shared/schema";

export interface IStorage {
  // Legacy user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company methods
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Profile methods
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  getProfilesByCompany(companyId: string): Promise<Profile[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Vehicle methods
  getVehicles(companyId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  getVehicleStatusCounts(companyId: string): Promise<{ [key: string]: number }>;
  
  // Driver methods
  getDrivers(companyId: string): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: string): Promise<boolean>;
  getDriversByStatus(companyId: string, status: string): Promise<Driver[]>;
}

export class DatabaseStorage implements IStorage {
  // Legacy user methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Company methods
  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await db.update(companies)
      .set({ ...company, updated_at: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result[0];
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.user_id, userId));
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email));
    return result[0];
  }

  async getProfilesByCompany(companyId: string): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.company_id, companyId));
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined> {
    const result = await db.update(profiles)
      .set({ ...profile, updated_at: new Date() })
      .where(eq(profiles.user_id, userId))
      .returning();
    return result[0];
  }

  // Vehicle methods
  async getVehicles(companyId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles)
      .where(eq(vehicles.company_id, companyId))
      .orderBy(desc(vehicles.created_at));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return result[0];
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(vehicle).returning();
    return result[0];
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const result = await db.update(vehicles)
      .set({ ...vehicle, updated_at: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return result[0];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getVehicleStatusCounts(companyId: string): Promise<{ [key: string]: number }> {
    const vehicleList = await this.getVehicles(companyId);
    const counts: { [key: string]: number } = {};
    
    vehicleList.forEach(vehicle => {
      const status = vehicle.status || 'available';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return counts;
  }

  // Driver methods
  async getDrivers(companyId: string): Promise<Driver[]> {
    return await db.select().from(drivers)
      .where(eq(drivers.company_id, companyId))
      .orderBy(desc(drivers.created_at));
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const result = await db.select().from(drivers).where(eq(drivers.id, id));
    return result[0];
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const result = await db.insert(drivers).values(driver).returning();
    return result[0];
  }

  async updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    const result = await db.update(drivers)
      .set({ ...driver, updated_at: new Date() })
      .where(eq(drivers.id, id))
      .returning();
    return result[0];
  }

  async deleteDriver(id: string): Promise<boolean> {
    const result = await db.delete(drivers).where(eq(drivers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDriversByStatus(companyId: string, status: string): Promise<Driver[]> {
    return await db.select().from(drivers)
      .where(and(eq(drivers.company_id, companyId), eq(drivers.is_active, status === 'active')))
      .orderBy(desc(drivers.created_at));
  }
}

export const storage = new DatabaseStorage();
