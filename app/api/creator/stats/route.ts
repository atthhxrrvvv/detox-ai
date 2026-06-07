import { randomUUID } from "crypto";
import { CREATOR_EMAIL } from "@/lib/constants";
import { requireCreatorApi } from "@/lib/creatorSecurity";
import { firestoreError, listFirestoreDocuments, patchFirestoreDocument, type FirestoreRestRecord } from "@/lib/firestoreRest";

function toDate(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(value: unknown, now = new Date()) {
  const date = toDate(value);
  return Boolean(date && date.toDateString() === now.toDateString());
}

function isSameMonth(value: unknown, now = new Date()) {
  const date = toDate(value);
  return Boolean(date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth());
}

function isSameWeek(value: unknown, now = new Date()) {
  const date = toDate(value);
  if (!date) return false;
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return date >= start && date <= now;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function countBy(collection: FirestoreRestRecord[], predicate: (item: FirestoreRestRecord) => boolean) {
  return collection.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);
}

function mostUsedModel(messages: FirestoreRestRecord[]) {
  const counts = new Map<string, number>();
  messages.forEach((message) => {
    const modelId = stringValue(message.modelId);
    if (!modelId) return;
    counts.set(modelId, (counts.get(modelId) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data yet";
}

function mostActiveUser(messages: FirestoreRestRecord[]) {
  const counts = new Map<string, number>();
  messages.forEach((message) => {
    const userEmail = stringValue(message.userEmail);
    if (!userEmail) return;
    counts.set(userEmail, (counts.get(userEmail) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data yet";
}

function countsByField(records: FirestoreRestRecord[], field: string) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    const value = stringValue(record[field]);
    if (!value) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1]));
}

export async function GET(request: Request) {
  const creator = await requireCreatorApi(request);
  if (!creator.ok) return creator.response;

  try {
    const [users, chats, messages, payments, reports, reactions, labVotes, models, logs] = await Promise.all([
      listFirestoreDocuments("users", creator.idToken),
      listFirestoreDocuments("chats", creator.idToken),
      listFirestoreDocuments("messages", creator.idToken),
      listFirestoreDocuments("payments", creator.idToken),
      listFirestoreDocuments("reports", creator.idToken),
      listFirestoreDocuments("message_reactions", creator.idToken).catch(() => []),
      listFirestoreDocuments("lab_votes", creator.idToken).catch(() => []),
      listFirestoreDocuments("models", creator.idToken).catch(() => []),
      listFirestoreDocuments("admin_logs", creator.idToken).catch(() => []),
    ]);

    const paidPlans = ["lite", "go", "pro", "premium", "ultimate"];
    const approvedPayments = payments.filter((payment) => payment.status === "approved");
    const approvedRevenue = approvedPayments.reduce((total, payment) => total + numberValue(payment.amount), 0);
    const todayRevenue = approvedPayments
      .filter((payment) => isSameDay(payment.approvedAt ?? payment.createdAt))
      .reduce((total, payment) => total + numberValue(payment.amount), 0);
    const weekRevenue = approvedPayments
      .filter((payment) => isSameWeek(payment.approvedAt ?? payment.createdAt))
      .reduce((total, payment) => total + numberValue(payment.amount), 0);
    const monthRevenue = approvedPayments
      .filter((payment) => isSameMonth(payment.approvedAt ?? payment.createdAt))
      .reduce((total, payment) => total + numberValue(payment.amount), 0);
    const revenueByPlan = Object.fromEntries(
      paidPlans.map((plan) => [
        plan,
        approvedPayments
          .filter((payment) => payment.plan === plan)
          .reduce((total, payment) => total + numberValue(payment.amount), 0),
      ]),
    );

    const planCounts = Object.fromEntries(
      ["free", ...paidPlans, "creator"].map((plan) => [
        plan,
        countBy(users, (user) => stringValue(user.plan, "free") === plan),
      ]),
    );

    const activePaidUsers = users.filter((user) => paidPlans.includes(stringValue(user.plan)) && stringValue(user.planStatus, "active") === "active");
    const expiredUsers = users.filter((user) => stringValue(user.planStatus) === "expired");

    return Response.json({
      creatorEmail: CREATOR_EMAIL,
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        freeUsers: planCounts.free ?? 0,
        liteUsers: planCounts.lite ?? 0,
        goUsers: planCounts.go ?? 0,
        proUsers: planCounts.pro ?? 0,
        premiumUsers: planCounts.premium ?? 0,
        ultimateUsers: planCounts.ultimate ?? 0,
        creatorUsers: planCounts.creator ?? 0,
        bannedUsers: countBy(users, (user) => Boolean(user.isBanned)),
        totalChats: chats.length,
        totalMessages: messages.length,
        messagesToday: countBy(messages, (message) => isSameDay(message.createdAt)),
        messagesThisWeek: countBy(messages, (message) => isSameWeek(message.createdAt)),
        messagesThisMonth: countBy(messages, (message) => isSameMonth(message.createdAt)),
        totalRevenue: approvedRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        pendingPayments: countBy(payments, (payment) => payment.status === "pending"),
        approvedPayments: approvedPayments.length,
        rejectedPayments: countBy(payments, (payment) => payment.status === "rejected"),
        activePaidPlans: activePaidUsers.length,
        expiredPlans: expiredUsers.length,
        totalReports: reports.length,
        openReports: countBy(reports, (report) => stringValue(report.status, "open") === "open"),
        solvedReports: countBy(reports, (report) => stringValue(report.status) === "solved"),
        totalReactions: reactions.length,
        improveRequests: countBy(reactions, (reaction) => stringValue(reaction.reaction) === "improve"),
        labVotes: labVotes.length,
        mostUsedModel: mostUsedModel(messages),
        mostActiveUser: mostActiveUser(messages),
        apiUsageEstimate: messages.reduce((total, message) => total + numberValue(message.tokensUsed), 0),
      },
      charts: {
        planCounts,
        revenueByPlan,
        paymentStatus: {
          pending: countBy(payments, (payment) => payment.status === "pending"),
          approved: approvedPayments.length,
          rejected: countBy(payments, (payment) => payment.status === "rejected"),
          expired: countBy(payments, (payment) => payment.status === "expired"),
          refunded: countBy(payments, (payment) => payment.status === "refunded"),
        },
        messageReactions: countsByField(reactions, "reaction"),
        labVotes: countsByField(labVotes, "featureId"),
      },
      collections: {
        users,
        chats,
        messages,
        payments,
        reports,
        reactions,
        labVotes,
        models,
        logs,
      },
    });
  } catch (error) {
    return firestoreError(error);
  }
}

export async function POST(request: Request) {
  const creator = await requireCreatorApi(request);
  if (!creator.ok) return creator.response;

  try {
    await patchFirestoreDocument("admin_logs", randomUUID(), creator.idToken, {
      adminEmail: creator.email,
      action: "DASHBOARD_REFRESHED",
      details: { route: "/api/creator/stats" },
      createdAt: new Date().toISOString(),
    });
    return Response.json({ ok: true });
  } catch (error) {
    return firestoreError(error);
  }
}
