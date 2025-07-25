import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInspectorSchema, insertSiteSchema, insertInspectionSchema, insertEmailRecordSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for photo uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const inspectionId = req.params.id;
    const uploadPath = `uploads/inspections/${inspectionId}`;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
  }
  if (!fs.existsSync('uploads/inspections')) {
    fs.mkdirSync('uploads/inspections', { recursive: true });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Demo routes (no authentication required)
  const demoUserId = "demo-user";
  
  app.get('/api/demo/inspectors', async (req, res) => {
    try {
      const inspectors = await storage.getInspectors(demoUserId);
      res.json(inspectors);
    } catch (error) {
      console.error("Error fetching demo inspectors:", error);
      res.status(500).json({ message: "Failed to fetch inspectors" });
    }
  });

  app.post('/api/demo/inspectors', async (req, res) => {
    try {
      const validatedData = insertInspectorSchema.parse({
        ...req.body,
        createdBy: demoUserId,
      });
      const inspector = await storage.createInspector(validatedData);
      res.json(inspector);
    } catch (error) {
      console.error("Error creating demo inspector:", error);
      res.status(400).json({ message: "Failed to create inspector" });
    }
  });

  app.get('/api/demo/sites', async (req, res) => {
    try {
      const query = req.query.search as string;
      const sites = query 
        ? await storage.searchSites(demoUserId, query)
        : await storage.getSites(demoUserId);
      res.json(sites);
    } catch (error) {
      console.error("Error fetching demo sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.post('/api/demo/sites', async (req, res) => {
    try {
      const validatedData = insertSiteSchema.parse({
        ...req.body,
        createdBy: demoUserId,
      });
      const site = await storage.createSite(validatedData);
      res.json(site);
    } catch (error) {
      console.error("Error creating demo site:", error);
      res.status(400).json({ message: "Failed to create site" });
    }
  });

  app.get('/api/demo/inspections', async (req, res) => {
    try {
      const inspections = await storage.getInspections(demoUserId);
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching demo inspections:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post('/api/demo/inspections', async (req, res) => {
    try {
      const validatedData = insertInspectionSchema.parse({
        ...req.body,
        createdBy: demoUserId,
      });
      const inspection = await storage.createInspection(validatedData);
      res.json(inspection);
    } catch (error) {
      console.error("Error creating demo inspection:", error);
      res.status(400).json({ message: "Failed to create inspection" });
    }
  });

  // Inspector routes
  app.get('/api/inspectors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspectors = await storage.getInspectors(userId);
      res.json(inspectors);
    } catch (error) {
      console.error("Error fetching inspectors:", error);
      res.status(500).json({ message: "Failed to fetch inspectors" });
    }
  });

  app.post('/api/inspectors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertInspectorSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const inspector = await storage.createInspector(validatedData);
      res.json(inspector);
    } catch (error) {
      console.error("Error creating inspector:", error);
      res.status(400).json({ message: "Failed to create inspector" });
    }
  });

  app.put('/api/inspectors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInspectorSchema.partial().parse(req.body);
      const inspector = await storage.updateInspector(id, validatedData);
      res.json(inspector);
    } catch (error) {
      console.error("Error updating inspector:", error);
      res.status(400).json({ message: "Failed to update inspector" });
    }
  });

  app.delete('/api/inspectors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInspector(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting inspector:", error);
      res.status(400).json({ message: "Failed to delete inspector" });
    }
  });

  // Site routes
  app.get('/api/sites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.search as string;
      
      const sites = query 
        ? await storage.searchSites(userId, query)
        : await storage.getSites(userId);
      
      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.post('/api/sites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSiteSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const site = await storage.createSite(validatedData);
      res.json(site);
    } catch (error) {
      console.error("Error creating site:", error);
      res.status(400).json({ message: "Failed to create site" });
    }
  });

  app.put('/api/sites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSiteSchema.partial().parse(req.body);
      const site = await storage.updateSite(id, validatedData);
      res.json(site);
    } catch (error) {
      console.error("Error updating site:", error);
      res.status(400).json({ message: "Failed to update site" });
    }
  });

  app.delete('/api/sites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSite(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting site:", error);
      res.status(400).json({ message: "Failed to delete site" });
    }
  });

  // Inspection routes
  app.get('/api/inspections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspections = await storage.getInspections(userId);
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.get('/api/inspections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      console.error("Error fetching inspection:", error);
      res.status(500).json({ message: "Failed to fetch inspection" });
    }
  });

  app.get('/api/demo/inspections/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      console.error("Error fetching demo inspection:", error);
      res.status(500).json({ message: "Failed to fetch inspection" });
    }
  });

  app.post('/api/inspections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertInspectionSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const inspection = await storage.createInspection(validatedData);
      res.json(inspection);
    } catch (error) {
      console.error("Error creating inspection:", error);
      res.status(400).json({ message: "Failed to create inspection" });
    }
  });

  app.put('/api/inspections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      // Allow partial updates, handle null values gracefully
      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, value]) => value !== null && value !== undefined)
      );
      const validatedData = insertInspectionSchema.partial().parse(cleanedBody);
      const inspection = await storage.updateInspection(id, validatedData);
      res.json(inspection);
    } catch (error) {
      console.error("Error updating inspection:", error);
      res.status(400).json({ message: "Failed to update inspection" });
    }
  });

  app.put('/api/demo/inspections/:id', async (req, res) => {
    try {
      const id = req.params.id;
      // Allow partial updates, handle null values gracefully
      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, value]) => value !== null && value !== undefined)
      );
      const validatedData = insertInspectionSchema.partial().parse(cleanedBody);
      const inspection = await storage.updateInspection(id, validatedData);
      res.json(inspection);
    } catch (error) {
      console.error("Error updating demo inspection:", error);
      res.status(400).json({ message: "Failed to update inspection" });
    }
  });

  app.delete('/api/inspections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      await storage.deleteInspection(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting inspection:", error);
      res.status(400).json({ message: "Failed to delete inspection" });
    }
  });

  // Photo upload route
  app.post('/api/inspections/:id/photos', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const inspectionId = req.params.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Store the relative path for the uploaded file
      const photoUrl = `/uploads/inspections/${inspectionId}/${file.filename}`;
      
      // Check if inspection exists, if not create a temporary record
      let inspection = await storage.getInspection(inspectionId);
      if (!inspection) {
        // Create temporary inspection record for photo uploads
        try {
          inspection = await storage.createInspection({
            id: inspectionId,
            createdBy: req.user?.claims?.sub || 'temp',
            documentNumber: `TEMP-${inspectionId.slice(0, 8)}`,
            inspectionDate: new Date(), // Use Date object instead of string
            photos: [photoUrl]
          });
        } catch (error) {
          console.error("Error creating temporary inspection:", error);
          return res.status(500).json({ message: "Failed to create temporary inspection" });
        }
      } else {
        // Update existing inspection with new photo
        const updatedPhotos = [...(inspection.photos || []), photoUrl];
        await storage.updateInspection(inspectionId, { photos: updatedPhotos });
      }

      res.json({ photoUrl });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Demo photo upload route
  app.post('/api/demo/inspections/:id/photos', upload.single('photo'), async (req, res) => {
    try {
      const inspectionId = req.params.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Store the relative path for the uploaded file
      const photoUrl = `/uploads/inspections/${inspectionId}/${file.filename}`;
      
      // Check if inspection exists, if not create a temporary record
      let inspection = await storage.getInspection(inspectionId);
      if (!inspection) {
        // Create temporary inspection record for photo uploads
        try {
          inspection = await storage.createInspection({
            id: inspectionId,
            createdBy: demoUserId,
            documentNumber: `TEMP-${inspectionId.slice(0, 8)}`,
            inspectionDate: new Date(), // Use Date object instead of string
            photos: [photoUrl]
          });
        } catch (error) {
          console.error("Error creating temporary demo inspection:", error);
          return res.status(500).json({ message: "Failed to create temporary inspection" });
        }
      } else {
        // Update existing inspection with new photo
        const updatedPhotos = [...(inspection.photos || []), photoUrl];
        await storage.updateInspection(inspectionId, { photos: updatedPhotos });
      }

      res.json({ photoUrl });
    } catch (error) {
      console.error("Error uploading demo photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Email sending route
  app.post('/api/inspections/:id/send-email', isAuthenticated, async (req: any, res) => {
    try {
      const inspectionId = req.params.id;
      const userId = req.user.claims.sub;
      const { toEmails, ccEmails, bccEmails, subject, pdfBuffer } = req.body;

      const inspection = await storage.getInspection(inspectionId);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      // Send email with PDF attachment
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(toEmails) ? toEmails.join(',') : toEmails,
        cc: Array.isArray(ccEmails) ? ccEmails.join(',') : ccEmails,
        bcc: Array.isArray(bccEmails) ? bccEmails.join(',') : bccEmails,
        subject: subject || `점검 보고서 - ${inspection.documentNumber}`,
        html: `
          <h2>보일러 점검 보고서</h2>
          <p>점검일: ${inspection.inspectionDate}</p>
          <p>계약처: ${inspection.siteId}</p>
          <p>점검결과: ${inspection.result}</p>
          <p>첨부된 PDF 파일을 확인해 주세요.</p>
        `,
        attachments: [
          {
            filename: `inspection-${inspection.documentNumber}.pdf`,
            content: Buffer.from(pdfBuffer, 'base64'),
            contentType: 'application/pdf',
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      // Record email sending
      await storage.createEmailRecord({
        inspectionId,
        toEmails: Array.isArray(toEmails) ? toEmails : [toEmails],
        ccEmails: Array.isArray(ccEmails) ? ccEmails : ccEmails ? [ccEmails] : undefined,
        bccEmails: Array.isArray(bccEmails) ? bccEmails : bccEmails ? [bccEmails] : undefined,
        subject: subject || `점검 보고서 - ${inspection.documentNumber}`,
        sentBy: userId,
        status: 'sent',
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Get email records
  app.get('/api/inspections/:id/emails', isAuthenticated, async (req: any, res) => {
    try {
      const inspectionId = req.params.id;
      const emailRecords = await storage.getEmailRecords(inspectionId);
      res.json(emailRecords);
    } catch (error) {
      console.error("Error fetching email records:", error);
      res.status(500).json({ message: "Failed to fetch email records" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
