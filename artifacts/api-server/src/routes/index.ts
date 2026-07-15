import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import userRouter from "./user";
import tasksRouter from "./tasks";
import adsRouter from "./ads";
import adsPostbackRouter from "./ads-postback";
import referralsRouter from "./referrals";
import withdrawalsRouter from "./withdrawals";
import telegramWebhookRouter from "./telegram-webhook";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(telegramWebhookRouter);
router.use(authRouter);
router.use(userRouter);
router.use(tasksRouter);
router.use(adsRouter);
router.use(adsPostbackRouter);
router.use(referralsRouter);
router.use(withdrawalsRouter);
router.use(adminRouter);

export default router;
