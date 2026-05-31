import type { PAYMENT_STATUSES } from "@/lib/constants";
import type { PlanId } from "@/lib/limits";

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type DetoxPayment = {
  paymentId: string;
  userId: string;
  userEmail: string;
  plan: Exclude<PlanId, "free" | "creator">;
  amount: number;
  currency: "INR";
  paymentMethod: "manual_upi" | "razorpay";
  upiId: string;
  transactionId: string;
  screenshotUrl?: string | null;
  status: PaymentStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
};
