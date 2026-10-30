import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import {
  CreateMealPlanSchema as CreateMealPlanBody,
  UpdateProfileSchema as UpdateMealPlanBody,
} from "../validators/schemas.js";
import { plansService, PlansServiceError } from "../services/plans.service.js";

const router = Router();
router.use(requireAuth);

function handlePlansError(err: unknown, res: import("express").Response) {
  if (err instanceof PlansServiceError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("plans error:", err);
  return res.status(500).json({ error: "Server error" });
}

router.get("/plans", async (req: AuthRequest, res) => {
  try {
    const plans = await plansService.list(req.userId!);
    return res.json(plans);
  } catch (err) {
    return handlePlansError(err, res);
  }
});

router.post("/plans", async (req: AuthRequest, res) => {
  try {
    const parsed = CreateMealPlanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const plan = await plansService.create(req.userId!, parsed.data);
    return res.status(201).json(plan);
  } catch (err) {
    return handlePlansError(err, res);
  }
});

router.get("/plans/:id", async (req: AuthRequest, res) => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idStr, 10);
    const plan = await plansService.getById(req.userId!, id);
    return res.json(plan);
  } catch (err) {
    return handlePlansError(err, res);
  }
});

router.patch("/plans/:id", async (req: AuthRequest, res) => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idStr, 10);
    const parsed = UpdateMealPlanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const plan = await plansService.update(req.userId!, id, parsed.data);
    return res.json(plan);
  } catch (err) {
    return handlePlansError(err, res);
  }
});

router.delete("/plans/:id", async (req: AuthRequest, res) => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idStr, 10);
    await plansService.remove(req.userId!, id);
    return res.status(204).send();
  } catch (err) {
    return handlePlansError(err, res);
  }
});

export default router;
