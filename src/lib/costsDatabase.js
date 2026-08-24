import { db } from "./db.js";

export const COSTS_DATABASE_NAME = "costsdb";
export const COSTS_DATABASE_VERSION = 2;

// Version 2 intentionally starts the application on the ID/timestamp cost model
// without migrating or deleting existing version 1 localStorage data.
export const costsDatabase = db.openCostsDB(
  COSTS_DATABASE_NAME,
  COSTS_DATABASE_VERSION
);
