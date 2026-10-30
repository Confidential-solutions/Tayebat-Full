import { Router, type NextFunction, type Request, type Response } from "express";
import { RegisterSchema, LoginSchema } from "../validators/schemas.js";
import { authService, AuthServiceError } from "../services/auth.service.js";

const router = Router();

function handleAuthError(err: unknown, res: Response, next: NextFunction) {
  if (err instanceof AuthServiceError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  next(err);
}

router.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const result = await authService.register(parsed.data);
    return res.status(201).json(result);
  } catch (err) {
    return handleAuthError(err, res, next);
  }
});

router.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const result = await authService.login(parsed.data);
    return res.json(result);
  } catch (err) {
    return handleAuthError(err, res, next);
  }
});

router.post("/auth/logout", (_req: Request, res: Response) => {
  return res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await authService.me(authHeader.slice(7));
    return res.json(user);
  } catch (err) {
    return handleAuthError(err, res, next);
  }
});

export default router;
