import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import stateRouter from "./state.js";
import playersRouter from "./players.js";
import bansRouter from "./bans.js";
import reportsRouter from "./reports.js";
import priorityListRouter from "./priority-list.js";
import activationsRouter from "./activations.js";
import webhookRouter from "./webhook.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stateRouter);
router.use(playersRouter);
router.use(bansRouter);
router.use(reportsRouter);
router.use(priorityListRouter);
router.use(activationsRouter);
router.use(webhookRouter);

export default router;
