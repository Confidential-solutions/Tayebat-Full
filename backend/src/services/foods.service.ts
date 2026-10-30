/**
 * FoodsService — list, categories, get by id
 */

import { eq, ilike, and, sql, type SQL } from "drizzle-orm";
import { db, foodsTable } from "../db/index.js";
import { BaseService } from "./base.js";

export class FoodsServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "FoodsServiceError";
  }
}

export type ListFoodsQuery = {
  category?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
};

export class FoodsService extends BaseService {
  constructor() {
    super("FoodsService");
  }

  async list(query: ListFoodsQuery) {
    const { category, status, search, page = "1", limit = "20" } = query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: SQL[] = [];
    if (category) conditions.push(eq(foodsTable.category, category));
    if (status === "tayyib" || status === "khabeeth") {
      conditions.push(eq(foodsTable.status, status));
    }
    if (search) {
      conditions.push(
        sql`(${ilike(foodsTable.name, `%${search}%`)} OR ${ilike(foodsTable.nameAr, `%${search}%`)})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(foodsTable)
        .where(whereClause)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(foodsTable)
        .where(whereClause),
    ]);

    return {
      items,
      total: countResult[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    };
  }

  async categories() {
    const rows = await db
      .select({
        category: foodsTable.category,
        status: foodsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(foodsTable)
      .groupBy(foodsTable.category, foodsTable.status);

    const map = new Map<
      string,
      {
        name: string;
        nameAr: string;
        tayyibCount: number;
        khabeethCount: number;
      }
    >();

    for (const row of rows) {
      if (!map.has(row.category)) {
        map.set(row.category, {
          name: row.category,
          nameAr: row.category,
          tayyibCount: 0,
          khabeethCount: 0,
        });
      }
      const entry = map.get(row.category)!;
      if (row.status === "tayyib") entry.tayyibCount = row.count;
      else entry.khabeethCount = row.count;
    }

    return Array.from(map.values());
  }

  async getById(id: number) {
    if (Number.isNaN(id)) {
      throw new FoodsServiceError("Invalid id", 400);
    }
    const [food] = await db
      .select()
      .from(foodsTable)
      .where(eq(foodsTable.id, id))
      .limit(1);
    if (!food) {
      throw new FoodsServiceError("Food not found", 404);
    }
    return food;
  }
}

export const foodsService = new FoodsService();
