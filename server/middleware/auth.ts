import { Request, Response, NextFunction } from "express";
import { hasPermission, UserRole } from "@shared/schema";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
    companyId: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!req.user) {
      return res.status(403).json({ error: "User context not available" });
    }

    const { role, permissions } = req.user;
    
    if (!hasPermission(role, permissions, permission)) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: permission,
        userRole: role
      });
    }

    next();
  };
}

export function requireRole(requiredRole: UserRole | UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!req.user) {
      return res.status(403).json({ error: "User context not available" });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Insufficient role permissions",
        required: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
}

export function requireCompanyAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!req.user) {
    return res.status(403).json({ error: "User context not available" });
  }

  // For routes that include company data validation
  const { companyId } = req.body;
  const resourceCompanyId = req.params.companyId || companyId;

  if (resourceCompanyId && resourceCompanyId !== req.user.companyId) {
    // Only admin users can access cross-company data
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        error: "Access denied: Cannot access resources from another company" 
      });
    }
  }

  next();
}

export function loadUserContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // This middleware should be called after requireAuth to load full user context
  // Implementation depends on your user storage logic
  next();
}