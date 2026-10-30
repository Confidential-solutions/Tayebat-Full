/**
 * PlansService — meal plans CRUD with entries
 */

import { eq, and } from "drizzle-orm";
import { db, mealPlansTable, mealPlanEntriesTable } from "../db/index.js";
import { BaseService } from "./base.js";

export class PlansServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "PlansServiceError";
  }
}

export class PlansService extends BaseService {
  constructor() {
    super("PlansService");
  }

  private async getPlanWithEntries(planId: number, userId: number) {
    const [plan] = await db
      .select()
      .from(mealPlansTable)
      .where(
        and(eq(mealPlansTable.id, planId), eq(mealPlansTable.userId, userId))
      )
      .limit(1);
    if (!plan) return null;
    const entries = await db
      .select()
      .from(mealPlanEntriesTable)
      .where(eq(mealPlanEntriesTable.planId, planId));
    return { ...plan, entries };
  }

  async list(userId: number) {
    const plans = await db
      .select()
      .from(mealPlansTable)
      .where(eq(mealPlansTable.userId, userId));

    return Promise.all(
      plans.map(async (p) => {
        const entries = await db
          .select()
          .from(mealPlanEntriesTable)
          .where(eq(mealPlanEntriesTable.planId, p.id));
        return { ...p, entries };
      })
    );
  }

  async create(userId: number, data: Record<string, unknown>) {
    const [plan] = await db
      .insert(mealPlansTable)
      .values({ ...data, userId } as typeof mealPlansTable.$inferInsert)
      .returning();
    return { ...plan, entries: [] as unknown[] };
  }

  async getById(userId: number, id: number) {
    if (Number.isNaN(id)) {
      throw new PlansServiceError("Invalid id", 400);
    }
    const plan = await this.getPlanWithEntries(id, userId);
    if (!plan) {
      throw new PlansServiceError("Plan not found", 404);
    }
    return plan;
  }

  async update(userId: number, id: number, data: Record<string, unknown>) {
    if (Number.isNaN(id)) {
      throw new PlansServiceError("Invalid id", 400);
    }
    const [updated] = await db
      .update(mealPlansTable)
      .set(data)
      .where(
        and(eq(mealPlansTable.id, id), eq(mealPlansTable.userId, userId))
      )
      .returning();
    if (!updated) {
      throw new PlansServiceError("Plan not found", 404);
    }
    const entries = await db
      .select()
      .from(mealPlanEntriesTable)
      .where(eq(mealPlanEntriesTable.planId, id));
    return { ...updated, entries };
  }

  async remove(userId: number, id: number) {
    if (Number.isNaN(id)) {
      throw new PlansServiceError("Invalid id", 400);
    }
    await db
      .delete(mealPlanEntriesTable)
      .where(eq(mealPlanEntriesTable.planId, id));
    await db
      .delete(mealPlansTable)
      .where(
        and(eq(mealPlansTable.id, id), eq(mealPlansTable.userId, userId))
      );
  }
}

export const plansService = new PlansService();
