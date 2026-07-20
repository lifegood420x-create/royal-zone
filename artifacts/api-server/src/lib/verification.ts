import { and, eq } from "drizzle-orm";
import {
  db,
  usersTable,
  withdrawalsTable,
  verificationRequestsTable,
  type VerificationRequest,
} from "@workspace/db";
import { getAppConfig, effectiveMinWithdraw } from "./config";
import { logger } from "./logger";

export interface VerificationDecision {
  request: VerificationRequest;
  withdrawalPlaced: boolean;
}

/**
 * Approves a pending verification request: marks the user verified and, if
 * the request carries the withdrawal the user was originally attempting,
 * places it (deducting balance) when it still passes the usual checks.
 *
 * The conditional update on status='pending' makes concurrent approvals
 * (admin click + gateway postback racing) settle at most once. Returns null
 * when the request doesn't exist or was already decided.
 */
export async function approveVerificationRequest(
  requestId: number,
): Promise<VerificationDecision | null> {
  const [request] = await db
    .update(verificationRequestsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(and(eq(verificationRequestsTable.id, requestId), eq(verificationRequestsTable.status, "pending")))
    .returning();
  if (!request) return null;

  await db
    .update(usersTable)
    .set({ isVerified: true })
    .where(eq(usersTable.id, request.userId));

  let withdrawalPlaced = false;
  if (request.withdrawAmount && request.withdrawMethod && request.withdrawAccountNumber) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, request.userId));
    const config = await getAppConfig();
    const minWithdraw = user ? effectiveMinWithdraw(config.minWithdraw, user.rejectedWithdrawCount) : Infinity;

    if (
      user &&
      !user.isBanned &&
      request.withdrawAmount >= minWithdraw &&
      request.withdrawAmount <= user.balance
    ) {
      await db.insert(withdrawalsTable).values({
        userId: user.id,
        amount: request.withdrawAmount,
        method: request.withdrawMethod,
        accountNumber: request.withdrawAccountNumber,
      });
      await db
        .update(usersTable)
        .set({ balance: user.balance - request.withdrawAmount })
        .where(eq(usersTable.id, user.id));
      withdrawalPlaced = true;
    } else {
      logger.info(
        { requestId, userId: request.userId },
        "Verification approved but parked withdrawal no longer valid; user must re-request",
      );
    }
  }

  return { request, withdrawalPlaced };
}
