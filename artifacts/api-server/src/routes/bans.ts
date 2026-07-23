import { Router, type IRouter } from "express";
import { readDb, writeDb, getCompactState, addLog, getCurrentUser } from "../lib/db-json.js";

const router: IRouter = Router();

router.get("/bans", async (req, res): Promise<void> => {
  const db = readDb();
  res.json(db.bans);
});

router.post("/bans", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as {
    banid?: string;
    name?: string;
    license?: string;
    steam?: string;
    discord?: string;
    reason?: string;
    expire?: string;
  };

  const ban = {
    id: Date.now(),
    banid: body.banid || body.name || "new",
    name: body.name || "غير معروف",
    license: body.license || "",
    steam: body.steam || "",
    discord: body.discord || "",
    reason: body.reason || "",
    bannedBy: user.name,
    expire: body.expire || "0",
    bannedOn: String(Math.floor(Date.now() / 1000)),
  };

  db.bans.unshift(ban);
  addLog(db, user.name, "add_ban", ban.name, ban);
  writeDb(db);
  res.json({ ok: true, ban, state: getCompactState(db) });
});

router.delete("/bans/:id", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const before = db.bans.length;
  db.bans = db.bans.filter((b) => String(b.id) !== rawId);

  addLog(db, user.name, "delete_ban", rawId, {});
  writeDb(db);
  res.json({ ok: true, deleted: before - db.bans.length, state: getCompactState(db) });
});

export default router;
