import { db } from "./db.js";

export const COSTS_DATABASE_NAME = "costsdb";
export const COSTS_DATABASE_VERSION = 1;

// Keep the application database identity in one place so current and future UI
// features share the same Cost Manager localStorage namespace.
export const costsDatabase = db.openCostsDB(
  COSTS_DATABASE_NAME,
  COSTS_DATABASE_VERSION
);
