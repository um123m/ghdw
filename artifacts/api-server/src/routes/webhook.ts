import { Router, type IRouter } from "express";
import { readDb, writeDb, addLog, getCurrentUser, findPlayer } from "../lib/db-json.js";

const router: IRouter = Router();

router.post("/game-webhook", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as { type?: string; player?: Record<string, unknown>; report?: Record<string, unknown> };

  if (body.type === "player_update" && body.player) {
    const incoming = body.player as { id?: number | string };
    const existing = findPlayer(db, incoming.id ?? "");
    if (existing) {
      Object.assign(existing, incoming);
    } else {
      db.players.push(body.player as never);
    }
  }

  if (body.type === "report" && body.report) {
    db.reports.unshift({
      id: Date.now(),
      status: "open",
      messages: [],
      ...(body.report as Record<string, unknown>),
    } as never);
  }

  addLog(db, user.name, "game_webhook", body.type || "unknown", body as Record<string, unknown>);
  writeDb(db);
  res.json({ ok: true });
});

export default router;
