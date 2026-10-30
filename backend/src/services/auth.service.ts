/**
 * AuthService — register, login, me
 * Business logic only; routes handle Zod + HTTP status.
 */

import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db, usersTable, userProfilesTable } from "../db/index.js";
import { env } from "../config/index.js";
import { hashPassword, comparePassword } from "../utils/security.js";
import { BaseService } from "./base.js";

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date | null;
};

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

function toPublicUser(user: {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date | null;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

/** Match existing route contract: payload is { userId: number }. */
function signToken(userId: number): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "30d" });
}

export class AuthService extends BaseService {
  constructor() {
    super("AuthService");
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      throw new AuthServiceError("Email already registered", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const [user] = await db
      .insert(usersTable)
      .values({
        name: input.name,
        email: input.email,
        passwordHash,
      })
      .returning();

    await db.insert(userProfilesTable).values({
      userId: user.id,
      goal: "general",
      language: "ar",
    });

    const token = signToken(user.id);
    return { user: toPublicUser(user), token };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1);

    if (!user) {
      throw new AuthServiceError("Invalid credentials", 401);
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthServiceError("Invalid credentials", 401);
    }

    return { user: toPublicUser(user), token: signToken(user.id) };
  }

  async me(token: string): Promise<PublicUser> {
    let decoded: { userId: number };
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    } catch {
      throw new AuthServiceError("Invalid token", 401);
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (!user) {
      throw new AuthServiceError("User not found", 401);
    }

    return toPublicUser(user);
  }
}

export const authService = new AuthService();
