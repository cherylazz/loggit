import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "loggit-db";
const DB_VERSION = 1;
const STORE_NAME = "logs";

interface LogEntry {
  id: string;
  type: "weather" | "sighting";
  timestamp: string;
  [key: string]: any;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

// In-memory fallback for Safari private browsing
let memoryFallback: LogEntry[] | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    }).catch(() => {
      // IDB unavailable (e.g. Safari private browsing) — use memory fallback
      memoryFallback = [];
      return null as any;
    });
  }
  return dbPromise;
}

export async function getAllLogs(): Promise<LogEntry[]> {
  const db = await getDB();
  if (!db) return memoryFallback ?? [];
  const all = await db.getAll(STORE_NAME);
  // Sort newest first
  return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addLog(log: LogEntry): Promise<void> {
  const db = await getDB();
  if (!db) {
    memoryFallback?.unshift(log);
    return;
  }
  await db.put(STORE_NAME, log);
}

export async function deleteLog(id: string): Promise<void> {
  const db = await getDB();
  if (!db) {
    if (memoryFallback) {
      memoryFallback = memoryFallback.filter((l) => l.id !== id);
    }
    return;
  }
  await db.delete(STORE_NAME, id);
}

export async function updateLog(id: string, data: Partial<LogEntry>): Promise<void> {
  const db = await getDB();
  if (!db) {
    if (memoryFallback) {
      memoryFallback = memoryFallback.map((l) => (l.id === id ? { ...l, ...data } : l));
    }
    return;
  }
  const existing = await db.get(STORE_NAME, id);
  if (existing) {
    await db.put(STORE_NAME, { ...existing, ...data });
  }
}

export async function clearAllLogs(): Promise<void> {
  const db = await getDB();
  if (!db) {
    memoryFallback = [];
    return;
  }
  await db.clear(STORE_NAME);
}

export async function migrateFromLocalStorage(): Promise<void> {
  const raw = localStorage.getItem("loggit-logs");
  if (!raw) return;

  try {
    const logs: LogEntry[] = JSON.parse(raw);
    const db = await getDB();
    if (!db) {
      // Memory fallback — just load them
      memoryFallback = logs;
      localStorage.removeItem("loggit-logs");
      return;
    }
    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const log of logs) {
      tx.store.put(log);
    }
    await tx.done;
    localStorage.removeItem("loggit-logs");
  } catch {
    // If migration fails, leave localStorage intact for next attempt
  }
}
