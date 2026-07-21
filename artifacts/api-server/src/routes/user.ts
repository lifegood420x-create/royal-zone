import { Router, type IRouter } from "express";
import { GetMeResponse, GetPublicConfigResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { toApiUser } from "../lib/serialize";
import { getAppConfig, effectiveMinWithdraw } from "../lib/config";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const data = GetMeResponse.parse(await toApiUser(req.currentUser!));
  res.json(data);
});

router.get("/config/public", requireAuth, async (req, res): Promise<void> => {
  const config = await getAppConfig();
  const data = GetPublicConfigResponse.parse({
    minWithdraw: effectiveMinWithdraw(config.minWithdraw, req.currentUser!.rejectedWithdrawCount),
    baseMinWithdraw: config.minWithdraw,
    referralBonus: config.referralBonus,
    adReward: config.adReward,
    adDailyLimit: config.adDailyLimit,
    adDurationSeconds: config.adDurationSeconds,
    botUsername: config.botUsername,
    channelUsername: config.channelUsername,
    adminUsername: config.adminUsername,
    monetagZoneId: config.monetagZoneId,
    adsgramBlockId: config.adsgramBlockId,
    monetagEnabled: config.monetagEnabled,
    adsgramEnabled: config.adsgramEnabled,
    requireAdPostback: config.requireAdPostback,
    bkashLogoUrl: config.bkashLogoUrl,
    nagadLogoUrl: config.nagadLogoUrl,
  });
  res.json(data);
});

export default router;
