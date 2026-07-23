import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../data/db.json");

export interface InventoryItem {
  name: string;
  qty: number;
  icon: string;
}

export interface Vehicle {
  plate: string;
  model: string;
  garage: string;
  state: string;
}

export interface PlayerNote {
  at: string;
  text: string;
}

export interface Player {
  id: number;
  order?: number;
  nickname: string;
  character?: string;
  steam?: string;
  license?: string;
  discord?: string;
  phone?: number | null;
  job: string;
  cash: number;
  bank: number;
  birth?: string;
  country?: string;
  status: string;
  priority?: number;
  gang?: string;
  gangRank?: string;
  avatar?: string;
  warns?: number;
  inventory: InventoryItem[];
  vehicles: Vehicle[];
  notes: PlayerNote[];
}

export interface Weapon {
  id: number;
  weapon: string;
  serial: string;
  editCount: number;
  date: string;
  playerId?: number;
  place?: string;
}

export interface ReportMessage {
  from: string;
  text: string;
  time: string;
}

export interface Report {
  id: number;
  status: string;
  name: string;
  messages: ReportMessage[];
}

export interface Ban {
  id: number;
  banid: string;
  name: string;
  license?: string;
  steam?: string;
  discord?: string;
  reason: string;
  bannedBy: string;
  expire?: string;
  bannedOn?: string;
}

export interface Gang {
  name: string;
  members: number;
}

export interface QueueEntry {
  name: string;
  discord?: string;
  wait?: string;
  priority?: number;
}

export interface PriorityEntry {
  id: number;
  name: string;
  discord?: string;
  license?: string;
  priority: number;
  note?: string;
  addedBy?: string;
  createdAt?: string;
}

export interface Activation {
  id: number;
  code: string;
  name: string;
  discord?: string;
  license?: string;
  note?: string;
  addedBy?: string;
  createdAt?: string;
}

export interface LogEntry {
  id: number;
  at: string;
  by: string;
  action: string;
  target: string;
  meta?: Record<string, unknown>;
}

export interface Settings {
  siteName?: string;
  welcome?: string;
  theme?: string;
  accent?: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  password?: string;
}

export interface DbData {
  settings: Settings;
  users: UserRecord[];
  players: Player[];
  weapons: Weapon[];
  reports: Report[];
  bans: Ban[];
  gangs: Gang[];
  queue: QueueEntry[];
  pending: unknown[];
  priorityList: PriorityEntry[];
  activations: Activation[];
  logs: LogEntry[];
}

export function readDb(): DbData {
  const raw = fs.readFileSync(DB_FILE, "utf8");
  const db = JSON.parse(raw) as DbData;
  if (!Array.isArray(db.priorityList)) db.priorityList = [];
  if (!Array.isArray(db.activations)) db.activations = [];
  if (!Array.isArray(db.logs)) db.logs = [];
  return db;
}

export function writeDb(db: DbData): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function getCompactState(db: DbData) {
  return {
    ok: true,
    settings: db.settings,
    stats: {
      players: db.players.length,
      online: db.players.filter((p) => p.status === "online").length,
      reports: db.reports.filter((r) => r.status !== "closed").length,
      bans: db.bans.length,
      weapons: db.weapons.length,
      queue: db.queue.length,
      priorities: (db.priorityList || []).length,
    },
    players: db.players,
    weapons: db.weapons,
    reports: db.reports,
    bans: db.bans,
    gangs: db.gangs,
    queue: db.queue,
    priorityList: db.priorityList || [],
    activations: db.activations || [],
    logs: db.logs.slice(-80).reverse(),
  };
}

export function addLog(
  db: DbData,
  userName: string,
  action: string,
  target: string,
  meta: Record<string, unknown> = {}
): void {
  db.logs.push({
    id: Date.now(),
    at: new Date().toISOString(),
    by: userName,
    action,
    target,
    meta,
  });
}

export function findPlayer(db: DbData, id: string | number): Player | undefined {
  return db.players.find((p) => String(p.id) === String(id));
}

export const ADMIN_USER: UserRecord = {
  id: 1,
  name: "abadykhaled",
  email: "Ms",
  role: "owner",
  avatar: "MS",
};

export function getCurrentUser(db: DbData): UserRecord {
  return db.users?.[0] || ADMIN_USER;
}
