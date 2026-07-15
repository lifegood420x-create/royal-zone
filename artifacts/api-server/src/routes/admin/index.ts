import { Router, type IRouter } from "express";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";
import payoutsRouter from "./payouts";
import tasksRouter from "./tasks";
import configRouter from "./config";
import webhookRouter from "./webhook";

const router: IRouter = Router();

router.use(dashboardRouter);
router.use(usersRouter);
router.use(payoutsRouter);
router.use(tasksRouter);
router.use(configRouter);
router.use(webhookRouter);

export default router;
