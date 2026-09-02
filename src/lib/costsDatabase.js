/*
 * The single shared database handle the React application uses. Every page
 * that needs to add/read/update/delete costs or generate a report imports
 * `costsDatabase` from here instead of calling db.openCostsDB() itself, so
 * the whole app is guaranteed to be reading and writing the same
 * localStorage-backed database (same name + version = same storage key).
 */
import { db } from './db.js';

export const COSTS_DATABASE_NAME = 'costsdb';
export const COSTS_DATABASE_VERSION = 2;

// Version 2 intentionally starts the application on the ID/timestamp cost model
// without migrating or deleting existing version 1 localStorage data.
export const costsDatabase = db.openCostsDB(
  COSTS_DATABASE_NAME,
  COSTS_DATABASE_VERSION
);
