import {
  users,
  inspectors,
  sites,
  inspections,
  emailRecords,
  type User,
  type UpsertUser,
  type Inspector,
  type InsertInspector,
  type Site,
  type InsertSite,
  type Inspection,
  type InsertInspection,
  type EmailRecord,
  type InsertEmailRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inspector operations
  getInspectors(userId: string): Promise<Inspector[]>;
  getInspector(id: number): Promise<Inspector | undefined>;
  createInspector(inspector: InsertInspector): Promise<Inspector>;
  updateInspector(id: number, inspector: Partial<InsertInspector>): Promise<Inspector>;
  deleteInspector(id: number): Promise<void>;
  
  // Site operations
  getSites(userId: string): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, site: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: number): Promise<void>;
  searchSites(userId: string, query: string): Promise<Site[]>;
  
  // Inspection operations
  getInspections(userId: string): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection>;
  deleteInspection(id: string): Promise<void>;
  getInspectionHistory(siteId: number): Promise<Inspection[]>;
  
  // Email record operations
  getEmailRecords(inspectionId: string): Promise<EmailRecord[]>;
  createEmailRecord(record: InsertEmailRecord): Promise<EmailRecord>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Inspector operations
  async getInspectors(userId: string): Promise<Inspector[]> {
    return await db
      .select()
      .from(inspectors)
      .where(eq(inspectors.createdBy, userId))
      .orderBy(desc(inspectors.createdAt));
  }

  async getInspector(id: number): Promise<Inspector | undefined> {
    const [inspector] = await db
      .select()
      .from(inspectors)
      .where(eq(inspectors.id, id));
    return inspector;
  }

  async createInspector(inspector: InsertInspector): Promise<Inspector> {
    const [newInspector] = await db
      .insert(inspectors)
      .values(inspector)
      .returning();
    return newInspector;
  }

  async updateInspector(id: number, inspector: Partial<InsertInspector>): Promise<Inspector> {
    const [updatedInspector] = await db
      .update(inspectors)
      .set({ ...inspector, updatedAt: new Date() })
      .where(eq(inspectors.id, id))
      .returning();
    return updatedInspector;
  }

  async deleteInspector(id: number): Promise<void> {
    await db.delete(inspectors).where(eq(inspectors.id, id));
  }

  // Site operations
  async getSites(userId: string): Promise<Site[]> {
    return await db
      .select()
      .from(sites)
      .where(eq(sites.createdBy, userId))
      .orderBy(desc(sites.createdAt));
  }

  async getSite(id: number): Promise<Site | undefined> {
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, id));
    return site;
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [newSite] = await db
      .insert(sites)
      .values(site)
      .returning();
    return newSite;
  }

  async updateSite(id: number, site: Partial<InsertSite>): Promise<Site> {
    const [updatedSite] = await db
      .update(sites)
      .set({ ...site, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return updatedSite;
  }

  async deleteSite(id: number): Promise<void> {
    await db.delete(sites).where(eq(sites.id, id));
  }

  async searchSites(userId: string, query: string): Promise<Site[]> {
    return await db
      .select()
      .from(sites)
      .where(
        and(
          eq(sites.createdBy, userId),
          or(
            like(sites.contractorName, `%${query}%`),
            like(sites.address, `%${query}%`)
          )
        )
      )
      .orderBy(desc(sites.createdAt));
  }

  // Inspection operations
  async getInspections(userId: string): Promise<Inspection[]> {
    return await db
      .select()
      .from(inspections)
      .where(eq(inspections.createdBy, userId))
      .orderBy(desc(inspections.createdAt));
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    const [inspection] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, id));
    return inspection;
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [newInspection] = await db
      .insert(inspections)
      .values(inspection)
      .returning();
    return newInspection;
  }

  async updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection> {
    const [updatedInspection] = await db
      .update(inspections)
      .set({ ...inspection, updatedAt: new Date() })
      .where(eq(inspections.id, id))
      .returning();
    return updatedInspection;
  }

  async deleteInspection(id: string): Promise<void> {
    await db.delete(inspections).where(eq(inspections.id, id));
  }

  async getInspectionHistory(siteId: number): Promise<Inspection[]> {
    return await db
      .select()
      .from(inspections)
      .where(eq(inspections.siteId, siteId))
      .orderBy(desc(inspections.inspectionDate));
  }

  // Email record operations
  async getEmailRecords(inspectionId: string): Promise<EmailRecord[]> {
    return await db
      .select()
      .from(emailRecords)
      .where(eq(emailRecords.inspectionId, inspectionId))
      .orderBy(desc(emailRecords.sentAt));
  }

  async createEmailRecord(record: InsertEmailRecord): Promise<EmailRecord> {
    const [newRecord] = await db
      .insert(emailRecords)
      .values(record)
      .returning();
    return newRecord;
  }
}

export const storage = new DatabaseStorage();
