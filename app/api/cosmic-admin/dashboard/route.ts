import { collection, doc, getDoc, getDocs, limit, query } from "firebase/firestore";
import { formatRupees } from "@/lib/utils";
import { jsonError } from "@/lib/api";
import { verifyAdminSession } from "@/lib/cosmicAdmin";
import { db } from "@/lib/firebase";
import { runtimeMaintenance, runtimeUsers } from "@/lib/adminRuntimeState";

type FirestoreDateLike = {
  toDate?: () => Date;
};

type UserRow = {
  uid: string;
  name: string;
  email: string;
  plan: string;
  role: string;
  totalMessages: number;
  chatCount: number;
  isBanned: boolean;
  blockedPermanently: boolean;
  joinedDate: string;
  lastActive: string;
};

type PaymentRow = {
  paymentId: string;
  userEmail: string;
  plan: string;
  billingCycle: string;
  amount: number;
  transactionId: string;
  screenshotUrl: string;
  status: string;
  createdAt: string;
};

function toDate(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (typeof value === "object" && "toDate" in value) return (value as FirestoreDateLike).toDate?.() ?? null;
  return null;
}

function formatDate(value: unknown) {
  const date = toDate(value);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("en-IN") : "-";
}

function isSameDay(date: Date, now = new Date()) {
  return date.toDateString() === now.toDateString();
}

function isSameMonth(date: Date, now = new Date()) {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

async function readCollection(name: string): Promise<Array<Record<string, unknown> & { id: string }>> {
  try {
    const snapshot = await getDocs(collection(db, name));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch {
    return [];
  }
}

async function readUsers() {
  try {
    const snapshot = await getDocs(query(collection(db, "users"), limit(50)));
    return snapshot.docs.map((item) => {
      const data = item.data();
      return {
        uid: String(data.uid ?? item.id),
        name: String(data.name ?? "Detox User"),
        email: String(data.email ?? "-"),
        plan: String(data.plan ?? "free"),
        role: String(data.role ?? data.plan ?? "free"),
        totalMessages: Number(data.totalMessages ?? data.monthlyMessages ?? 0),
        chatCount: 0,
        isBanned: Boolean(data.isBanned),
        blockedPermanently: Boolean(data.blockedPermanently),
        joinedDate: formatDate(data.createdAt),
        lastActive: formatDate(data.lastActive ?? data.lastLogin),
      } satisfies UserRow;
    });
  } catch {
    return [] satisfies UserRow[];
  }
}

async function readMaintenance() {
  try {
    const snapshot = await getDoc(doc(db, "app_settings", "global"));
    const data = snapshot.data() as { maintenanceMode?: boolean; maintenanceMessage?: string } | undefined;
    if (runtimeMaintenance.maintenanceMode) return runtimeMaintenance;
    return {
      maintenanceMode: Boolean(data?.maintenanceMode),
      maintenanceMessage: data?.maintenanceMessage || "Detox AI is in maintenance mode.",
    };
  } catch {
    return runtimeMaintenance;
  }
}

const sections = [
  {
    title: "Payment Management",
    items: ["Pending payments", "Screenshots", "Transaction IDs", "Approve", "Reject", "Payment history"],
  },
  {
    title: "Revenue Dashboard",
    items: ["Daily revenue", "Monthly revenue", "Plan-wise revenue", "Premium vs Pro", "Average revenue per user"],
  },
  {
    title: "Plans & Limits",
    items: ["Daily limits", "Monthly limits", "File upload limits", "Allowed models", "Signup toggle", "Purchase toggle"],
  },
  {
    title: "Model Management",
    items: ["Enable models", "Disable models", "Edit prompts", "Change access", "Usage count", "Add model"],
  },
  {
    title: "Chat Moderation",
    items: ["Reported chats", "Search by email", "Open chat", "Flag chat", "Delete harmful chat", "Ban abusive user"],
  },
  {
    title: "Reports Center",
    items: ["Open reports", "Reviewed reports", "Wrong answer", "Bug", "Unsafe content", "Payment issue"],
  },
  {
    title: "API Usage",
    items: ["Requests today", "Tokens used", "Most used models", "Failed requests", "Average response time"],
  },
  {
    title: "AI Tools Manager",
    items: ["Enable tools", "Edit tool prompt", "View usage", "Add tool", "Delete tool", "Reorder tools"],
  },
  {
    title: "App Settings",
    items: ["App name", "Logo", "Default model", "UPI ID", "Support email", "Guest mode"],
  },
  {
    title: "Security Center",
    items: ["Failed logins", "Suspicious activity", "Rate limits", "Banned users", "Admin logs"],
  },
  {
    title: "Audit Logs",
    items: ["Payment approved", "Plan changed", "Chat viewed", "Model changed", "Maintenance enabled"],
  },
] as const;

export async function GET(request: Request) {
  const session = verifyAdminSession(request.headers.get("authorization"));
  if (!session) {
    return jsonError("Admin session required.", 401);
  }

  const [rawUsers, chats, messages, payments, maintenance] = await Promise.all([
    readUsers(),
    readCollection("chats"),
    readCollection("messages"),
    readCollection("payments"),
    readMaintenance(),
  ]);
  const users = rawUsers.map((user) => ({
    ...user,
    ...runtimeUsers.get(user.uid),
    chatCount: chats.filter((chat) => String(chat.userId ?? "") === user.uid || String(chat.userEmail ?? "") === user.email).length,
  }));

  const paidPayments = payments.filter((item) => String(item.status ?? "").toLowerCase() === "approved");
  const pendingPayments = payments.filter((item) => String(item.status ?? "").toLowerCase() === "pending");
  const rejectedPayments = payments.filter((item) => String(item.status ?? "").toLowerCase() === "rejected");
  const pendingPaymentRows = pendingPayments
    .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))
    .slice(0, 25)
    .map((payment) => ({
      paymentId: String(payment.paymentId ?? payment.id),
      userEmail: String(payment.userEmail ?? "-"),
      plan: String(payment.planName ?? payment.plan ?? "-"),
      billingCycle: String(payment.billingCycle ?? "monthly"),
      amount: Number(payment.amount ?? 0),
      transactionId: String(payment.transactionId ?? "-"),
      screenshotUrl: String(payment.screenshotUrl ?? ""),
      status: String(payment.status ?? "pending"),
      createdAt: formatDate(payment.createdAt),
    })) satisfies PaymentRow[];
  const monthlyRevenue = paidPayments.reduce((sum, payment) => {
    const created = toDate(payment.createdAt);
    return created && isSameMonth(created) ? sum + Number(payment.amount ?? 0) : sum;
  }, 0);
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const messagesToday = messages.filter((message) => {
    const created = toDate(message.createdAt);
    return created ? isSameDay(created) : false;
  }).length;
  const messagesThisMonth = messages.filter((message) => {
    const created = toDate(message.createdAt);
    return created ? isSameMonth(created) : false;
  }).length;
  const modelCounts = messages.reduce<Record<string, number>>((counts, message) => {
    const modelId = String(message.modelId ?? "");
    if (modelId) counts[modelId] = (counts[modelId] ?? 0) + 1;
    return counts;
  }, {});
  const mostUsedModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const estimatedApiCost = Math.ceil(
    messages.reduce((sum, message) => sum + Number(message.tokensUsed ?? 0), 0) * 0.00002,
  );

  const overviewStats = [
    ["Total users", String(users.length)],
    ["Free users", String(users.filter((user) => user.plan === "free").length)],
    ["Lite users", String(users.filter((user) => user.plan === "lite").length)],
    ["Go users", String(users.filter((user) => user.plan === "go").length)],
    ["Pro users", String(users.filter((user) => user.plan === "pro").length)],
    ["Premium users", String(users.filter((user) => user.plan === "premium").length)],
    ["Ultimate users", String(users.filter((user) => user.plan === "ultimate").length)],
    ["Banned users", String(users.filter((user) => user.isBanned || user.blockedPermanently).length)],
    ["Total chats", String(chats.length)],
    ["Total messages", String(messages.length)],
    ["Messages today", String(messagesToday)],
    ["Messages this month", String(messagesThisMonth)],
    ["Total revenue", formatRupees(totalRevenue)],
    ["Monthly revenue", formatRupees(monthlyRevenue)],
    ["Pending payments", String(pendingPayments.length)],
    ["Approved payments", String(paidPayments.length)],
    ["Rejected payments", String(rejectedPayments.length)],
    ["Most used model", mostUsedModel],
    ["API usage estimate", formatRupees(estimatedApiCost)],
  ] satisfies Array<[string, string]>;

  return Response.json({
    admin: session.username,
    expiresAt: session.expiresAt,
    overviewStats,
    users,
    payments: pendingPaymentRows,
    maintenance,
    sections,
    notices: [
      "Dashboard numbers come from Firestore collections. If no real users or payments exist yet, the numbers stay zero.",
      "Admin access token is memory-only. Refreshing this page signs the admin out.",
      "Chat review is only for safety, moderation, abuse prevention, support, and service improvement.",
    ],
  });
}
