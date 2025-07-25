import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inspectors table
export const inspectors = pgTable("inspectors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  company: varchar("company"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sites table
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  contractorName: varchar("contractor_name").notNull(),
  businessType: varchar("business_type"),
  address: text("address").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inspections table
export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentNumber: varchar("document_number"),
  visitCount: varchar("visit_count"),
  inspectionDate: timestamp("inspection_date"),
  inspectorId: integer("inspector_id").references(() => inspectors.id),
  result: varchar("result"),
  facilityManager: varchar("facility_manager"),
  summary: text("summary"),
  
  // Site information
  siteId: integer("site_id").references(() => sites.id),
  contractorName: varchar("contractor_name"), // 현장명
  province: varchar("province"), // 시/도
  district: varchar("district"), // 시/군/구
  detailAddress: text("detail_address"), // 상세주소
  products: jsonb("products").$type<Array<{name: string, count: number}>>().default([]),
  installationOther: text("installation_other"),
  
  // Technical details
  fuel: text("fuel"), // 사용 연료 선택
  exhaustType: text("exhaust_type"), // 연도 선택 (새 필드)
  electrical: text("electrical"), // 정격 전압 선택
  piping: text("piping"), // 배관 선택
  waterSupply: text("water_supply"), // 수질 선택 (새 필드)
  control: text("control"), // 제어 방식 선택
  purpose: varchar("purpose"), // 설치 용도 선택
  deliveryType: text("delivery_type"), // 남품 형태 선택 (새 필드)
  installationDate: text("installation_date"),
  
  // Photos
  photos: text("photos").array(),
  
  // Checklist
  checklist: jsonb("checklist").$type<Array<{
    id: string;
    question: string;
    answer: 'yes' | 'no' | null;
    reason?: string;
  }>>().default([]),
  
  // Status and metadata
  status: varchar("status").default("draft"), // draft, completed, sent
  progress: integer("progress").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email records table
export const emailRecords = pgTable("email_records", {
  id: serial("id").primaryKey(),
  inspectionId: uuid("inspection_id").references(() => inspections.id),
  toEmails: text("to_emails").array().notNull(),
  ccEmails: text("cc_emails").array(),
  bccEmails: text("bcc_emails").array(),
  subject: varchar("subject"),
  sentAt: timestamp("sent_at").defaultNow(),
  status: varchar("status").default("pending"), // pending, sent, failed
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
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

// Zod schemas
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
    
    // Handle Korean short date format (YY-MM-DD or YY.MM.DD)
    const shortDateRegex = /^(\d{2})[-.](\d{2})[-.](\d{2})$/;
    const match = val.match(shortDateRegex);
    
    if (match) {
      const [, year, month, day] = match;
      // Convert YY to full year (assuming 20YY for years 00-99)
      const fullYear = `20${year}`;
      return new Date(`${fullYear}-${month}-${day}`);
    }
    
    // Handle full date format (YYYY-MM-DD)
    const fullDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (fullDateRegex.test(val)) {
      return new Date(val);
    }
    
    // Try to parse as Date
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }),
  installationDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    
    // Handle Korean short date format (YY-MM-DD or YY.MM.DD)
    const shortDateRegex = /^(\d{2})[-.](\d{2})[-.](\d{2})$/;
    const match = val.match(shortDateRegex);
    
    if (match) {
      const [, year, month, day] = match;
      // Convert YY to full year (assuming 20YY for years 00-99)
      const fullYear = `20${year}`;
      return new Date(`${fullYear}-${month}-${day}`);
    }
    
    // Handle full date format (YYYY-MM-DD)
    const fullDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (fullDateRegex.test(val)) {
      return new Date(val);
    }
    
    // Try to parse as Date
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  })
});

export const insertEmailRecordSchema = createInsertSchema(emailRecords).omit({
  id: true,
  sentAt: true,
});
