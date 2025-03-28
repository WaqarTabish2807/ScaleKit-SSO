import { users, type User, type InsertUser, type InsertScalekitUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByScalekitId(scalekitId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScalekitUser(user: InsertScalekitUser): Promise<User>;
  updateUserTokens(userId: number, accessToken: string, refreshToken: string, idToken: string, expiresAt: number): Promise<User>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByScalekitId(scalekitId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.scalekit_id === scalekitId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      scalekit_id: null,
      email: null,
      first_name: null,
      last_name: null,
      access_token: null,
      refresh_token: null,
      id_token: null,
      token_expires_at: null
    };
    this.users.set(id, user);
    return user;
  }

  async createScalekitUser(userData: InsertScalekitUser): Promise<User> {
    const id = this.currentId++;
    // Generate a random password since it's required but not used for Scalekit users
    const randomPassword = Math.random().toString(36).slice(-12);
    
    const user: User = {
      id,
      username: userData.username,
      password: `scalekit_${randomPassword}`, // Mark as Scalekit user with a random password
      scalekit_id: userData.scalekit_id ?? null,
      email: userData.email ?? null,
      first_name: userData.first_name ?? null,
      last_name: userData.last_name ?? null,
      access_token: userData.access_token ?? null,
      refresh_token: userData.refresh_token ?? null,
      id_token: userData.id_token ?? null,
      token_expires_at: userData.token_expires_at ?? null
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(
    userId: number, 
    accessToken: string, 
    refreshToken: string, 
    idToken: string, 
    expiresAt: number
  ): Promise<User> {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...user,
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: idToken,
      token_expires_at: expiresAt
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();
