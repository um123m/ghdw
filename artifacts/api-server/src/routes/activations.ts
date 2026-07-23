import { Router, type IRouter } from "express";
import { readDb, writeDb, getCompactState, addLog, getCurrentUser } from "../lib/db-json.js";

const router: IRouter = Router();

router.get("/activations", async (req, res): Promise<void> => {
  const db = readDb();
  res.json(db.activations || []);
});

router.post("/activations", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as {
    code?: string;
    name?: string;
    discord?: string;
    license?: string;
    note?: string;
  };

  if (!db.activations) db.activations = [];

  const activation = {
    id: Date.now(),
    code: body.code || ("MS-" + Math.random().toString(36).slice(2, 8).toUpperCase()),
    name: body.name || "غير معروف",
    discord: body.discord || "",
    license: body.license || "",
    note: body.note || "",
    addedBy: user.name,
    createdAt: new Date().toISOString(),
  };

  db.activations.unshift(activation);
  addLog(db, user.name, "add_activation", activation.name, activation);
  writeDb(db);
  res.json({ ok: true, activation, state: getCompactState(db) });
});

router.delete("/activations/:id", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!db.activations) db.activations = [];
  const before = db.activations.length;
  db.activations = db.activations.filter((a) => String(a.id) !== rawId);

  addLog(db, user.name, "delete_activation", rawId, {});
  writeDb(db);
  res.json({ ok: true, deleted: before - db.activations.length, state: getCompactState(db) });
});

export default router;
