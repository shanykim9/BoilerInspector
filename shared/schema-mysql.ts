import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  json,
  int,
  serial,
  index,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for MySQL
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for MySQL
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Inspectors table for MySQL
export const inspectors = mysqlTable("inspectors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  company: varchar("company", { length: 255 }),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Sites table for MySQL
export const sites = mysqlTable("sites", {
  id: serial("id").primaryKey(),
  contractorName: varchar("contractor_name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 255 }),
  address: text("address").notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Inspections table for MySQL
export const inspections = mysqlTable("inspections", {
  id: varchar("id", { length: 36 }).primaryKey(),
  documentNumber: varchar("document_number", { length: 255 }),
  visitCount: varchar("visit_count", { length: 50 }),
  inspectionDate: timestamp("inspection_date"),
  inspectorId: int("inspector_id"),
  result: varchar("result", { length: 255 }),
  facilityManager: varchar("facility_manager", { length: 255 }),
  summary: text("summary"),
  
  // Site information
  siteId: int("site_id"),
  contractorName: varchar("contractor_name", { length: 255 }),
  province: varchar("province", { length: 255 }),
  district: varchar("district", { length: 255 }),
  detailAddress: text("detail_address"),
  products: json("products").$type<Array<{name: string, count: number}>>(),
  installationOther: text("installation_other"),
  
  // Technical details
  fuel: text("fuel"),
  exhaustType: text("exhaust_type"),
  electrical: text("electrical"),
  piping: text("piping"),
  waterSupply: text("water_supply"),
  control: text("control"),
  purpose: varchar("purpose", { length: 255 }),
  deliveryType: text("delivery_type"),
  installationDate: text("installation_date"),
  
  // Photos
  photos: json("photos").$type<string[]>(),
  
  // Checklist
  checklist: json("checklist").$type<Array<{
    id: string;
    question: string;
    answer: 'yes' | 'no' | null;
    reason?: string;
  }>>(),
  
  // Status and metadata
  status: varchar("status", { length: 50 }).default("draft"),
  progress: int("progress").default(0),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Email records table for MySQL
export const emailRecords = mysqlTable("email_records", {
  id: serial("id").primaryKey(),
  inspectionId: varchar("inspection_id", { length: 36 }),
  toEmails: json("to_emails").$type<string[]>().notNull(),
  ccEmails: json("cc_emails").$type<string[]>(),
  bccEmails: json("bcc_emails").$type<string[]>(),
  subject: varchar("subject", { length: 500 }),
  sentAt: timestamp("sent_at").defaultNow(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertInspector = typeof inspectors.$inferInsert;
export type Inspector = typeof inspectors.$inferSelect;

export type InsertSite = typeof sites.$inferInsert;
export type Site = typeof sites.$inferSelect;

export type InsertInspection = typeof inspections.$inferInsert;
export type Inspection = typeof inspections.$inferSelect;

export type InsertEmailRecord = typeof emailRecords.$inferInsert;
export type EmailRecord = typeof emailRecords.$inferSelect;

// Zod schemas for MySQL
export const insertInspectorSchema = createInsertSchema(inspectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  inspectionDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    
    const shortDateRegex = /^(\d{2})[-.](\d{2})[-.](\d{2})$/;
    const match = val.match(shortDateRegex);
    
    if (match) {
      const [, year, month, day] = match;
      const fullYear = `20${year}`;
      return new Date(`${fullYear}-${month}-${day}`);
    }
    
    const fullDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (fullDateRegex.test(val)) {
      return new Date(val);
    }
    
    return new Date(val);
  }),
});

export const insertEmailRecordSchema = createInsertSchema(emailRecords).omit({
  id: true,
  createdAt: true,
});