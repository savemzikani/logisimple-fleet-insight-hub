import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCompanySchema,
  insertProfileSchema,
  insertVehicleSchema,
  insertDriverSchema,
  getUserPermissions
} from "@shared/schema";
import { 
  requireAuth, 
  requirePermission, 
  requireRole, 
  requireCompanyAccess,
  AuthenticatedRequest 
} from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to load user context for authenticated routes
  app.use("/api", async (req: AuthenticatedRequest, res, next) => {
    if (req.session?.userId) {
      try {
        const profile = await storage.getProfile(req.session.userId);
        if (profile) {
          req.user = {
            id: profile.user_id,
            email: profile.email,
            role: profile.role as any,
            permissions: profile.permissions || [],
            companyId: profile.company_id
          };
        }
      } catch (error) {
        console.error("Error loading user context:", error);
      }
    }
    next();
  });

  // Authentication routes
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find profile by email
      const profile = await storage.getProfileByEmail(email);
      
      if (!profile || !profile.is_active) {
        return res.status(401).json({ error: { message: "Invalid credentials" } });
      }
      
      // Set session
      req.session.userId = profile.user_id;
      req.session.companyId = profile.company_id;
      
      res.json({ 
        data: {
          user: { id: profile.user_id, email: profile.email },
          profile: {
            ...profile,
            permissions: getUserPermissions(profile.role as any, profile.permissions || [])
          }
        }
      });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({ error: { message: "Internal server error" } });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, userData } = req.body;
      
      // Check if user already exists
      const existingProfile = await storage.getProfileByEmail(email);
      if (existingProfile) {
        return res.status(400).json({ error: { message: "User already exists" } });
      }
      
      // Create company first
      const company = await storage.createCompany({
        name: userData.company_name,
        email: email
      });
      
      // Create profile with proper role and permissions
      const userId = crypto.randomUUID();
      const role = "admin"; // First user is always admin
      const permissions = getUserPermissions(role);
      
      const profile = await storage.createProfile({
        user_id: userId,
        company_id: company.id,
        email: email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        role: role,
        permissions: permissions,
        is_active: true
      });
      
      // Set session
      req.session.userId = userId;
      req.session.companyId = company.id;
      
      res.json({ 
        data: {
          user: { id: userId, email },
          profile: {
            ...profile,
            permissions: permissions
          }
        }
      });
    } catch (error) {
      console.error("Sign up error:", error);
      res.status(500).json({ error: { message: "Internal server error" } });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not sign out" });
      }
      res.json({ message: "Signed out successfully" });
    });
  });

  // Company routes
  app.get("/api/companies/:id", requireAuth, requirePermission("companies:read"), async (req: AuthenticatedRequest, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/companies/:id", requireAuth, requirePermission("companies:update"), async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, validatedData);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Update company error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", requireAuth, requirePermission("vehicles:read"), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.companyId;
      const vehicles = await storage.getVehicles(companyId);
      res.json(vehicles);
    } catch (error) {
      console.error("Get vehicles error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vehicles", requireAuth, requirePermission("vehicles:create"), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.companyId;
      const validatedData = insertVehicleSchema.parse({
        ...req.body,
        company_id: companyId
      });
      
      const vehicle = await storage.createVehicle(validatedData);
      res.json(vehicle);
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, requirePermission("vehicles:update"), async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Update vehicle error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, requirePermission("vehicles:delete"), async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteVehicle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Delete vehicle error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/vehicles/status-counts", requireAuth, requirePermission("vehicles:read"), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.companyId;
      const counts = await storage.getVehicleStatusCounts(companyId);
      res.json(counts);
    } catch (error) {
      console.error("Get vehicle status counts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profile route
  app.get("/api/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const profile = await storage.getProfile(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json({
        ...profile,
        permissions: getUserPermissions(profile.role as any, profile.permissions || [])
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Driver routes
  app.get("/api/drivers", requireAuth, requirePermission("drivers:read"), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.companyId;
      const drivers = await storage.getDrivers(companyId);
      res.json(drivers);
    } catch (error) {
      console.error("Get drivers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/drivers", requireAuth, requirePermission("drivers:create"), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.companyId;
      const validatedData = insertDriverSchema.parse({
        ...req.body,
        company_id: companyId
      });
      
      const driver = await storage.createDriver(validatedData);
      res.json(driver);
    } catch (error) {
      console.error("Create driver error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/drivers/:id", requireAuth, requirePermission("drivers:update"), async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertDriverSchema.partial().parse(req.body);
      const driver = await storage.updateDriver(req.params.id, validatedData);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      console.error("Update driver error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/drivers/:id", requireAuth, requirePermission("drivers:delete"), async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteDriver(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json({ message: "Driver deleted successfully" });
    } catch (error) {
      console.error("Delete driver error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/drivers/status/:status", requireAuth, requirePermission("drivers:read"), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user!.companyId;
      const drivers = await storage.getDriversByStatus(companyId, req.params.status);
      res.json(drivers);
    } catch (error) {
      console.error("Get drivers by status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
