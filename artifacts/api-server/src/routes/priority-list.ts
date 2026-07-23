import { Router, type IRouter } from "express";
import { readDb, writeDb, getCompactState, addLog, getCurrentUser } from "../lib/db-json.js";

const router: IRouter = Router();

router.get("/priority-list", async (req, res): Promise<void> => {
  const db = readDb();
  res.json(db.priorityList || []);
});

router.post("/priority-list", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as {
    name?: string;
    discord?: string;
    license?: string;
    priority?: number | string;
    note?: string;
  };

  if (!db.priorityList) db.priorityList = [];

  const entry = {
    id: Date.now(),
    name: body.name || "غير معروف",
    discord: body.discord || "",
    license: body.license || "",
    priority: Number(body.priority || 1),
    note: body.note || "",
    addedBy: user.name,
    createdAt: new Date().toISOString(),
  };

  db.priorityList.unshift(entry);
  addLog(db, user.name, "add_priority", entry.name, entry);
  writeDb(db);
  res.json({ ok: true, priority: entry, state: getCompactState(db) });
});

router.delete("/priority-list/:id", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!db.priorityList) db.priorityList = [];
  const before = db.priorityList.length;
  db.priorityList = db.priorityList.filter((p) => String(p.id) !== rawId);

  addLog(db, user.name, "delete_priority", rawId, {});
  writeDb(db);
  res.json({ ok: true, deleted: before - db.priorityList.length, state: getCompactState(db) });
});

export default router;
