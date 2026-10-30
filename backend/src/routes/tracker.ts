import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import {
  CreateTrackerEntrySchema as CreateTrackerEntryBody,
  UpdateTrackerEntrySchema as UpdateTrackerEntryBody,
  CreateWeightLogSchema as CreateWeightLogBody,
} from "../validators/schemas.js";
import {
  trackerService,
  TrackerServiceError,
} from "../services/tracker.service.js";

const router = Router();
router.use(requireAuth);

function handleTrackerError(err: unknown, res: import("express").Response) {
  if (err instanceof TrackerServiceError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("tracker error:", err);
  return res.status(500).json({ error: "Server error" });
}

router.get("/tracker/entries", async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query as Record<string, string>;
    const entries = await trackerService.listEntries(req.userId!, {
      startDate,
      endDate,
    });
    return res.json(entries);
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

router.post("/tracker/entries", async (req: AuthRequest, res) => {
  try {
    const parsed = CreateTrackerEntryBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const entry = await trackerService.createEntry(req.userId!, parsed.data);
    return res.status(201).json(entry);
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

router.patch("/tracker/entries/:id", async (req: AuthRequest, res) => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idStr, 10);
    const parsed = UpdateTrackerEntryBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const entry = await trackerService.updateEntry(req.userId!, id, parsed.data);
    return res.json(entry);
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

router.delete("/tracker/entries/:id", async (req: AuthRequest, res) => {
  try {
    const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idStr, 10);
    await trackerService.deleteEntry(req.userId!, id);
    return res.status(204).send();
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

router.get("/tracker/today", async (req: AuthRequest, res) => {
  try {
    const summary = await trackerService.todaySummary(req.userId!);
    return res.json(summary);
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

router.get("/tracker/weight", async (req: AuthRequest, res) => {
  try {
    const { days = "30" } = req.query as Record<string, string>;
    const logs = await trackerService.listWeight(
      req.userId!,
      parseInt(days, 10)
    );
    return res.json(logs);
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

router.post("/tracker/weight", async (req: AuthRequest, res) => {
  try {
    const parsed = CreateWeightLogBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const log = await trackerService.createWeight(req.userId!, parsed.data);
    return res.status(201).json(log);
  } catch (err) {
    return handleTrackerError(err, res);
  }
});

export default router;
