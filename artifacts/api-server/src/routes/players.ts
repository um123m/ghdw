import { Router, type IRouter } from "express";
import { readDb, writeDb, getCompactState, addLog, findPlayer, getCurrentUser } from "../lib/db-json.js";

const router: IRouter = Router();

router.post("/action", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as {
    playerId?: number | string;
    kind?: string;
    value?: string;
    qty?: number;
    index?: number;
    expire?: string;
  };

  const p = findPlayer(db, body.playerId ?? "");
  if (!p) {
    res.status(404).json({ ok: false, error: "اللاعب غير موجود" });
    return;
  }

  const kind = String(body.kind || "note");
  const value = body.value || "";

  if (kind === "give_item") {
    p.inventory = p.inventory || [];
    p.inventory.push({ name: value || "item", qty: Number(body.qty || 1), icon: "📦" });
  }
  if (kind === "remove_item") {
    p.inventory = (p.inventory || []).filter((_, i) => i !== Number(body.index));
  }
  if (kind === "cash") {
    p.cash = Math.max(0, Number(p.cash) + Number(value || 0));
  }
  if (kind === "bank") {
    p.bank = Math.max(0, Number(p.bank) + Number(value || 0));
  }
  if (kind === "warn") {
    p.warns = Number(p.warns || 0) + 1;
  }
  if (kind === "note") {
    p.notes = p.notes || [];
    p.notes.push({ at: new Date().toISOString(), text: value });
  }
  if (kind === "ban") {
    db.bans.unshift({
      id: Date.now(),
      banid: String(p.id),
      name: p.nickname,
      license: (p.license || "").replace("license:", ""),
      steam: (p.steam || "").replace("steam:", ""),
      discord: p.discord || "",
      reason: value || "Admin ban",
      bannedBy: user.name,
      expire: body.expire || "0",
      bannedOn: String(Math.floor(Date.now() / 1000)),
    });
  }
  if (kind === "kick") {
    p.status = "offline";
  }

  addLog(db, user.name, kind, p.nickname, body as Record<string, unknown>);
  writeDb(db);
  res.json({ ok: true, player: p, state: getCompactState(db) });
});

router.post("/priority", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as { playerId?: number | string; priority?: number };

  const p = findPlayer(db, body.playerId ?? "");
  if (!p) {
    res.status(404).json({ ok: false, error: "غير موجود" });
    return;
  }

  p.priority = Number(body.priority || 0);
  addLog(db, user.name, "priority", p.nickname, { priority: p.priority });
  writeDb(db);
  res.json({ ok: true, state: getCompactState(db) });
});

export default router;
