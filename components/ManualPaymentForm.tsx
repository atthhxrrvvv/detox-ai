"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { CheckCircle2, CreditCard, FileImage, Loader2, QrCode, ShieldCheck, Upload, X } from "lucide-react";
import { CREATOR_UPI_ID } from "@/lib/constants";
import { auth, db, storage } from "@/lib/firebase";

const plans = [
  { id: "lite", name: "Lite", monthly: 299, yearly: 2999, badge: "Starter", files: "3 files/month" },
  { id: "go", name: "Go", monthly: 599, yearly: 5999, badge: "Popular", files: "15 files/month" },
  { id: "pro", name: "Pro", monthly: 1199, yearly: 11999, badge: "Best Value", files: "75 files/month" },
  { id: "premium", name: "Premium", monthly: 2499, yearly: 24999, badge: "Creator Choice", files: "300 files/month" },
  { id: "ultimate", name: "Ultimate", monthly: 4999, yearly: 49999, badge: "Max Power", files: "1000 files/month" },
] as const;

type BillingCycle = "monthly" | "yearly";
type PromoResult = {
  message: string;
  tone: "success" | "error";
};

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function ManualPaymentForm({ initialPlan = "pro" }: { initialPlan?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [isRedeemingPromo, setIsRedeemingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsAuthReady(true);
    });
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[2],
    [selectedPlanId],
  );
  const amount = billingCycle === "monthly" ? selectedPlan.monthly : selectedPlan.yearly;

  async function redeemPromoCode() {
    setError("");
    setPromoResult(null);

    if (!user) {
      setPromoResult({ message: "Login first so this Detox code can be linked to your account.", tone: "error" });
      return;
    }

    if (!promoCode.trim()) {
      setPromoResult({ message: "Incorrect code. Enter your Detox code first.", tone: "error" });
      return;
    }

    setIsRedeemingPromo(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode,
          plan: selectedPlan.id,
          idToken,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Detox code redemption failed.");
      }

      setPromoResult({ message: "Redeem successfully. Your plan is active for 30 days.", tone: "success" });
      window.setTimeout(() => {
        router.push(`/payment/success?source=promo&paymentId=${data.paymentId ?? ""}`);
      }, 1200);
    } catch (promoError) {
      const message = promoError instanceof Error ? promoError.message : "Detox code redemption failed.";
      const cleanMessage = message.replace("Firebase: ", "");
      const lowerMessage = cleanMessage.toLowerCase();
      const displayMessage = lowerMessage.includes("already used")
        ? "Code already used."
        : lowerMessage.includes("not valid") || lowerMessage.includes("inactive") || lowerMessage.includes("incorrect")
          ? "Incorrect code."
          : cleanMessage;
      setPromoResult({ message: displayMessage, tone: "error" });
    } finally {
      setIsRedeemingPromo(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Login first so this payment can be linked to your Detox AI account.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Enter the UPI transaction ID from your payment app.");
      return;
    }

    if (!screenshot) {
      setError("Upload the payment screenshot before sending the request.");
      return;
    }

    if (!screenshot.type.startsWith("image/")) {
      setError("Upload an image screenshot such as JPG, PNG, or WebP.");
      return;
    }

    if (screenshot.size > 5 * 1024 * 1024) {
      setError("Screenshot must be under 5 MB.");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentId = crypto.randomUUID();
      const safeName = screenshot.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const screenshotRef = ref(storage, `payment-screenshots/${user.uid}/${paymentId}-${safeName}`);
      await uploadBytes(screenshotRef, screenshot, {
        contentType: screenshot.type,
        customMetadata: {
          paymentId,
          userEmail: user.email ?? "",
        },
      });
      const screenshotUrl = await getDownloadURL(screenshotRef);

      await setDoc(doc(db, "payments", paymentId), {
        paymentId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName ?? "Detox user",
        plan: selectedPlan.id,
        planName: selectedPlan.name,
        billingCycle,
        amount,
        currency: "INR",
        paymentMethod: "manual_upi",
        upiId: CREATOR_UPI_ID,
        transactionId: transactionId.trim(),
        screenshotUrl,
        screenshotName: screenshot.name,
        status: "pending",
        userNote: note.trim(),
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectedReason: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push(`/payment/pending?paymentId=${paymentId}`);
    } catch (paymentError) {
      const message = paymentError instanceof Error ? paymentError.message : "Payment request failed.";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1fr]">
      <div className="glass overflow-hidden rounded-3xl">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
              <QrCode size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-400">Scan and pay to</p>
              <p className="text-xl font-semibold text-white">{CREATOR_UPI_ID}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-3 shadow-[0_30px_120px_rgba(0,0,0,0.38)]">
            <Image
              src="/payment-qr.jpeg"
              alt="Atharv Sharma FAM UPI QR code for Detox AI payments"
              width={900}
              height={1400}
              priority
              className="h-auto w-full rounded-[1.35rem] object-cover"
            />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            {[
              "Pay with PhonePe, Google Pay, Paytm, BHIM, or any UPI app.",
              "Do not share UPI PIN, OTP, card details, or bank passwords.",
              "Your plan activates only after manual payment verification.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-200" size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
            <CreditCard size={20} />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-white">Send payment request</h2>
            <p className="text-sm text-slate-400">Attach the transaction screenshot for manual review.</p>
          </div>
        </div>

        {!isAuthReady ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <Loader2 className="animate-spin text-cyan-100" size={16} />
            Checking your account...
          </div>
        ) : !user ? (
          <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50">
            Login first so the subscription can be linked to the correct account.
            <Link href="/login" className="mt-3 inline-flex h-10 items-center rounded-xl bg-white px-4 font-semibold text-slate-950">
              Login to continue
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm text-cyan-50">
            Payment will be linked to <span className="font-semibold">{user.email}</span>.
          </div>
        )}

        <label className="mt-5 block text-sm text-slate-300" htmlFor="plan">
          Selected plan
        </label>
        <select
          id="plan"
          value={selectedPlanId}
          onChange={(event) => setSelectedPlanId(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-cyan-300/60"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - {formatRupees(plan.monthly)}/month - {plan.badge}
            </option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={`h-10 rounded-xl text-sm font-semibold transition ${
                billingCycle === cycle ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/8"
              }`}
            >
              {cycle === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Amount to pay</p>
              <p className="mt-1 text-3xl font-semibold text-white">{formatRupees(amount)}</p>
            </div>
            <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100">
              {selectedPlan.badge}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{selectedPlan.files} included after approval.</p>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="block text-sm font-semibold text-emerald-50" htmlFor="promoCode">
                Detox code
              </label>
              <input
                id="promoCode"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 font-mono text-sm uppercase tracking-wide outline-none focus:border-emerald-300/60"
                placeholder="DTX-PRO-XXXXXX-001"
              />
            </div>
            <button
              type="button"
              onClick={redeemPromoCode}
              disabled={!user || isRedeemingPromo}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-200 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRedeemingPromo ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              {isRedeemingPromo ? "Checking..." : "Redeem"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-emerald-50/75">
            Select the matching plan first. Plus codes are used with the Go plan in this app.
          </p>
          {promoResult ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-5 text-center ${
                promoResult.tone === "success"
                  ? "border-emerald-200/40 bg-emerald-400/20 text-emerald-50"
                  : "border-red-300/40 bg-red-500/20 text-red-50"
              }`}
            >
              <div
                className={`mx-auto grid size-12 place-items-center rounded-full ${
                  promoResult.tone === "success" ? "bg-emerald-200 text-emerald-950" : "bg-red-200 text-red-950"
                }`}
              >
                {promoResult.tone === "success" ? <CheckCircle2 size={24} /> : <X size={24} />}
              </div>
              <p className="mt-3 text-lg font-semibold">{promoResult.message}</p>
            </div>
          ) : null}
        </div>

        <label className="mt-4 block text-sm text-slate-300" htmlFor="transactionId">
          UPI transaction ID
        </label>
        <input
          id="transactionId"
          value={transactionId}
          onChange={(event) => setTransactionId(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60"
          placeholder="Example: 412345678901"
          required
        />

        <label className="mt-4 block text-sm text-slate-300" htmlFor="screenshot">
          Payment screenshot
        </label>
        <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-center text-sm text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/8">
          {screenshot ? <FileImage className="text-cyan-100" size={20} /> : <Upload size={20} />}
          <span className="font-semibold text-white">{screenshot ? "Update screenshot" : "Upload screenshot"}</span>
          <span className="max-w-full truncate text-xs text-slate-500">
            {screenshot ? screenshot.name : "JPG, PNG, or WebP under 5 MB"}
          </span>
          <input
            id="screenshot"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)}
            required
          />
        </label>

        <label className="mt-4 block text-sm text-slate-300" htmlFor="note">
          Payment note
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none focus:border-cyan-300/60"
          placeholder="Optional: payment app name, phone number ending, or plan request detail."
        />

        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <button
          disabled={!user || isSubmitting}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
          {isSubmitting ? "Sending request..." : "Send request for approval"}
        </button>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          By submitting, you confirm that the screenshot is yours and you agree that Detox AI may store it for payment verification,
          payment history, and support.
        </p>
      </form>
    </div>
  );
}
