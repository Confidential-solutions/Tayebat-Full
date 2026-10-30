/**
 * TrackerService — entries, today summary, weight logs
 */

import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, trackerEntriesTable, weightLogsTable } from "../db/index.js";
import { BaseService } from "./base.js";

export class TrackerServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "TrackerServiceError";
  }
}

export class TrackerService extends BaseService {
  constructor() {
    super("TrackerService");
  }

  async listEntries(
    userId: number,
    opts: { startDate?: string; endDate?: string }
  ) {
    const conditions = [eq(trackerEntriesTable.userId, userId)];
    if (opts.startDate) {
      conditions.push(gte(trackerEntriesTable.date, opts.startDate));
    }
    if (opts.endDate) {
      conditions.push(lte(trackerEntriesTable.date, opts.endDate));
    }

    return db
      .select()
      .from(trackerEntriesTable)
      .where(and(...conditions))
      .orderBy(desc(trackerEntriesTable.createdAt));
  }

  async createEntry(userId: number, data: Record<string, unknown>) {
    const [entry] = await db
      .insert(trackerEntriesTable)
      .values({ ...data, userId } as typeof trackerEntriesTable.$inferInsert)
      .returning();
    return entry;
  }

  async updateEntry(
    userId: number,
    id: number,
    data: Record<string, unknown>
  ) {
    if (Number.isNaN(id)) {
      throw new TrackerServiceError("Invalid id", 400);
    }
    const [entry] = await db
      .update(trackerEntriesTable)
      .set(data)
      .where(
        and(
          eq(trackerEntriesTable.id, id),
          eq(trackerEntriesTable.userId, userId)
        )
      )
      .returning();
    if (!entry) {
      throw new TrackerServiceError("Entry not found", 404);
    }
    return entry;
  }

  async deleteEntry(userId: number, id: number) {
    if (Number.isNaN(id)) {
      throw new TrackerServiceError("Invalid id", 400);
    }
    await db
      .delete(trackerEntriesTable)
      .where(
        and(
          eq(trackerEntriesTable.id, id),
          eq(trackerEntriesTable.userId, userId)
        )
      );
  }

  async todaySummary(userId: number) {
    const today = new Date().toISOString().split("T")[0];
    const entries = await db
      .select()
      .from(trackerEntriesTable)
      .where(
        and(
          eq(trackerEntriesTable.userId, userId),
          eq(trackerEntriesTable.date, today)
        )
      );

    const meals = entries.filter((e) => e.type === "meal");
    const tayyibCount = meals.filter((e) => e.foodStatus === "tayyib").length;
    const khabeethCount = meals.filter(
      (e) => e.foodStatus === "khabeeth"
    ).length;
    const waterEntries = entries.filter((e) => e.type === "water");
    const waterMl = waterEntries.reduce(
      (sum, e) => sum + (e.waterMl ?? 0),
      0
    );
    const fastingEntries = entries.filter((e) => e.type === "fasting");
    const fastingHours = fastingEntries.reduce(
      (sum, e) => sum + (e.fastingHours ?? 0),
      0
    );
    const hungerValues = meals
      .map((e) => e.hungerLevel)
      .filter(Boolean) as number[];
    const energyValues = meals
      .map((e) => e.energyLevel)
      .filter(Boolean) as number[];
    const avgHunger = hungerValues.length
      ? hungerValues.reduce((a, b) => a + b, 0) / hungerValues.length
      : 0;
    const avgEnergy = energyValues.length
      ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
      : 0;
    const adherence =
      meals.length > 0
        ? Math.round((tayyibCount / meals.length) * 100)
        : 0;

    return {
      date: today,
      mealCount: meals.length,
      tayyibCount,
      khabeethCount,
      waterMl,
      fastingHours,
      averageHunger: Math.round(avgHunger * 10) / 10,
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      adherenceScore: adherence,
    };
  }

  async listWeight(userId: number, days = 30) {
    const daysNum = Number.isNaN(days) ? 30 : days;
    const since = new Date();
    since.setDate(since.getDate() - daysNum);
    const sinceStr = since.toISOString().split("T")[0];

    return db
      .select()
      .from(weightLogsTable)
      .where(
        and(
          eq(weightLogsTable.userId, userId),
          gte(weightLogsTable.date, sinceStr)
        )
      )
      .orderBy(weightLogsTable.date);
  }

  async createWeight(userId: number, data: Record<string, unknown>) {
    const [log] = await db
      .insert(weightLogsTable)
      .values({ ...data, userId } as typeof weightLogsTable.$inferInsert)
      .returning();
    return log;
  }
}

export const trackerService = new TrackerService();
