import { Router, type IRouter } from "express";
import { readDb, writeDb, getCompactState, addLog, getCurrentUser } from "../lib/db-json.js";

const router: IRouter = Router();

router.post("/reports/message", async (req, res): Promise<void> => {
  const db = readDb();
  const user = getCurrentUser(db);
  const body = req.body as { reportId?: number | string; text?: string };

  const report = db.reports.find((r) => String(r.id) === String(body.reportId));
  if (!report) {
    res.status(404).json({ ok: false, error: "الريبورت غير موجود" });
    return;
  }

  report.messages = report.messages || [];
  report.messages.push({
    from: user.name,
    text: body.text || "",
    time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
  });

  addLog(db, user.name, "report_message", report.name, { reportId: report.id });
  writeDb(db);
  res.json({ ok: true, report, state: getCompactState(db) });
});

export default router;
