import { Router, type IRouter } from "express";
import { readDb, getCompactState, getCurrentUser } from "../lib/db-json.js";

const router: IRouter = Router();

router.get("/me", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  res.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

router.get("/state", async (req, res): Promise<void> => {
  const db = readDb();
  res.json(getCompactState(db));
});

export default router;
