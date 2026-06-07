import { validateChatAccess, type AccessUser } from "@/lib/access";
import { generateMistralReply, type DetoxChatEngineMessage } from "@/lib/mistral";
import { getDetoxModel } from "@/lib/models";
import { jsonError } from "@/lib/api";
import { isCreator } from "@/lib/creator";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";
import { DETOX_OWNER_RESPONSE, isOwnerQuestion } from "@/lib/ownerResponse";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const maxDuration = 300;

const minimumReplyDelayMs = 10000;
const maximumReplyDelayMs = 300000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeoutAfter(ms: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Detox AI response took longer than 5 minutes. Try again with a shorter message.")), ms);
  });
}

async function waitForMinimumReplyDelay(startedAt: number) {
  const remainingDelay = minimumReplyDelayMs - (Date.now() - startedAt);
  if (remainingDelay > 0) {
    await sleep(remainingDelay);
  }
}

async function getAppControlState() {
  try {
    const snapshot = await getDoc(doc(db, "app_settings", "global"));
    const data = snapshot.data() as { maintenanceMode?: boolean; maintenanceMessage?: string } | undefined;
    return {
      maintenanceMode: Boolean(data?.maintenanceMode),
      maintenanceMessage: data?.maintenanceMessage || "Detox AI is in maintenance mode.",
    };
  } catch {
    return {
      maintenanceMode: false,
      maintenanceMessage: "Detox AI is in maintenance mode.",
    };
  }
}

async function getUserBlockState(uid: string) {
  try {
    const snapshot = await getDoc(doc(db, "users", uid));
    const data = snapshot.data() as {
      isBanned?: boolean;
      blockedPermanently?: boolean;
      plan?: string;
      planExpiresAt?: string;
      planStatus?: string;
    } | undefined;

    // Server-side plan expiration check — never trust an expired plan
    let plan = data?.plan;
    if (plan && plan !== "free" && plan !== "creator" && data?.planExpiresAt) {
      const expiresAt = new Date(data.planExpiresAt);
      if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
        plan = "free";
      }
    }

    return {
      isBanned: Boolean(data?.isBanned),
      blockedPermanently: Boolean(data?.blockedPermanently),
      plan,
    };
  } catch {
    return {
      isBanned: false,
      blockedPermanently: false,
      plan: undefined,
    };
  }
}

function normalizeServerPlan(value: unknown): AccessUser["plan"] | undefined {
  const plan = String(value ?? "");
  if (["free", "lite", "go", "pro", "premium", "ultimate", "creator", "banned"].includes(plan)) {
    return plan as AccessUser["plan"];
  }
  return undefined;
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const verifiedUser = await verifyFirebaseIdToken(String(body.idToken ?? ""));
    if (!verifiedUser?.email) {
      return jsonError("Please sign in before using Detox AI.", 401);
    }

    const message = String(body.message ?? "");
    const modelId = String(body.modelId ?? "flash-1.0");
    const researchMode = Boolean(body.researchMode);
    const rawTemperature = Number(body.temperature ?? 0.7);
    const temperature = Math.min(2, Math.max(0.5, Number.isFinite(rawTemperature) ? rawTemperature : 0.7));
    const modelTemperature = Math.min(1.5, temperature);
    const history = Array.isArray(body.history)
      ? (body.history
          .filter((item: DetoxChatEngineMessage) => item?.role && item?.content)
          .map((item: DetoxChatEngineMessage) => ({
            role: item.role,
            content: String(item.content).slice(0, 6000),
          })) as DetoxChatEngineMessage[])
      : [];
    const requestedUser = (body.user ?? {}) as AccessUser;
    const blockState = await getUserBlockState(verifiedUser.uid);
    if (blockState.blockedPermanently || blockState.isBanned) {
      return jsonError("This account is blocked from Detox AI.", 403);
    }

    const appControl = await getAppControlState();
    if (appControl.maintenanceMode && !isCreator(verifiedUser.email)) {
      return jsonError(appControl.maintenanceMessage, 503);
    }

    const user = {
      dailyMessages: requestedUser.dailyMessages ?? 0,
      monthlyMessages: requestedUser.monthlyMessages ?? 0,
      email: verifiedUser.email,
      plan: isCreator(verifiedUser.email)
        ? "creator"
        : normalizeServerPlan(blockState.plan) ?? requestedUser.plan ?? "free",
      isBanned: blockState.isBanned || blockState.blockedPermanently,
    } satisfies AccessUser;

    if (!message.trim()) {
      return jsonError("Message is required.");
    }

    const model = getDetoxModel(modelId);
    if (!model) {
      return jsonError("Unknown Detox AI model.", 404);
    }

    const highTemperatureMode = temperature > 1;
    const accessUser = highTemperatureMode
      ? {
          ...user,
          dailyMessages: user.dailyMessages ? user.dailyMessages * 2 : user.dailyMessages,
          monthlyMessages: user.monthlyMessages ? user.monthlyMessages * 2 : user.monthlyMessages,
        }
      : user;
    const access = validateChatAccess(accessUser, modelId, message);
    if (!access.ok) {
      return jsonError(access.error ?? "Access denied.", access.status);
    }

    if (isOwnerQuestion(message)) {
      await waitForMinimumReplyDelay(startedAt);
      return Response.json({
        reply: DETOX_OWNER_RESPONSE,
        modelId,
        detoxModel: model.displayName,
        tokensUsed: DETOX_OWNER_RESPONSE.length,
        temperature,
        saved: false,
      });
    }

    const effectiveMessage = researchMode
      ? `${message}\n\nResearch mode is on. Give a more careful, source-aware answer. If the answer depends on live web data, clearly say that live browsing is not connected in this Detox AI build and explain what should be verified.`
      : message;

    const reply = await Promise.race([
      generateMistralReply(modelId, effectiveMessage, history, modelTemperature),
      timeoutAfter(maximumReplyDelayMs),
    ]);
    await waitForMinimumReplyDelay(startedAt);

    return Response.json({
      reply: reply.content,
      modelId,
      detoxModel: model.displayName,
      tokensUsed: reply.tokensUsed,
      temperature,
      modelTemperature,
      saved: false,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Chat failed.", 500);
  }
}
