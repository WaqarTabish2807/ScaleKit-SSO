import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Fields for Scalekit integration
  scalekit_id: text("scalekit_id").unique(),
  email: text("email").unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  id_token: text("id_token"),
  token_expires_at: integer("token_expires_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema for Scalekit user creation
export const scalekitUserSchema = z.object({
  username: z.string(),
  email: z.string().email().optional().nullable(),
  scalekit_id: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  access_token: z.string().optional().nullable(),
  refresh_token: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  token_expires_at: z.number().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertScalekitUser = z.infer<typeof scalekitUserSchema>;
export type User = typeof users.$inferSelect;
