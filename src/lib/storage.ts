/**
 * Local JSON storage helpers (development/demo only).
 * Replace with a persistent database for production.
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readCollection<T>(name: string): T[] {
  ensureDataDir();
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8")) as T[];
  } catch {
    return [];
  }
}

export function writeCollection<T>(name: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf8");
}

export function findOne<T extends Record<string, unknown>>(
  name: string,
  predicate: (item: T) => boolean
): T | undefined {
  return readCollection<T>(name).find(predicate);
}

export function upsert<T extends Record<string, unknown>>(
  name: string,
  item: T,
  matchFn: (existing: T) => boolean
): void {
  const collection = readCollection<T>(name);
  const idx = collection.findIndex(matchFn);
  if (idx >= 0) {
    collection[idx] = item;
  } else {
    collection.push(item);
  }
  writeCollection(name, collection);
}
