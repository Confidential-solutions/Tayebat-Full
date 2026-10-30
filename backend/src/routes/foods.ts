import { Router } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { foodsService, FoodsServiceError } from "../services/foods.service.js";

const router = Router();

router.get("/foods", async (req: AuthRequest, res) => {
  try {
    const result = await foodsService.list(
      req.query as Record<string, string>
    );
    return res.json(result);
  } catch (err: unknown) {
    console.error("GET /foods error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ error: message });
  }
});

router.get("/foods/categories", async (_req, res) => {
  try {
    const result = await foodsService.categories();
    return res.json(result);
  } catch (err: unknown) {
    console.error("GET /foods/categories error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ error: message });
  }
});

router.get("/foods/:id", async (req, res) => {
  try {
    const id = parseInt(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
      10
    );
    const food = await foodsService.getById(id);
    return res.json(food);
  } catch (err) {
    if (err instanceof FoodsServiceError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("GET /foods/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
