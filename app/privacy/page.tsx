import { PageShell } from "@/components/PageShell";
import { CREATOR_EMAIL, CREATOR_UPI_ID } from "@/lib/constants";

const privacySections = [
  {
    title: "1. About Detox AI",
    body: [
      "Detox AI is an AI assistant platform created and founded by Atharv Sharma. It helps users with chatting, coding, studying, writing, ideas, problem solving, productivity, and other AI-powered tasks.",
      "Detox AI may use trusted third-party technology, hosting, authentication, database, storage, payment, and AI systems to run the service.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "We may collect account information such as name, email address, profile photo, login method, user role, user plan, account creation date, and last login.",
      "We may collect chat information such as user messages, AI responses, chat titles, selected model, timestamps, reported messages, deleted status, and archived status.",
      "We may collect usage information such as message counts, daily and monthly limits, models used, tools used, login activity, feature usage, error logs, and approximate system usage.",
      "For manual UPI payments, we may collect selected plan, amount, UPI transaction ID, payment screenshot, payment status, approval or rejection details, and subscription dates.",
      "If file upload features are used, we may collect uploaded file name, type, size, content, upload date, and extracted text needed to answer user requests.",
    ],
  },
  {
    title: "3. How We Use Information",
    body: [
      "We use information to create accounts, authenticate users, provide AI responses, save chat history, manage plans, apply usage limits, process payment verification, activate paid plans, improve features, fix bugs, prevent abuse, and provide support.",
      "We use payment screenshots only for payment verification, creator review, support, fraud prevention, and audit records.",
    ],
  },
  {
    title: "4. AI Processing",
    body: [
      "When you send a message to Detox AI, your prompt, current chat context, selected model information, and uploaded file text may be processed to generate an AI response.",
      "Do not enter passwords, OTPs, UPI PINs, private banking details, secret keys, or highly sensitive information into Detox AI. AI responses can be wrong, incomplete, or outdated, so verify important information.",
    ],
  },
  {
    title: "5. Creator and Admin Access",
    body: [
      "Detox AI includes creator/admin tools for platform management, safety, support, moderation, plan control, payment approval, and system maintenance.",
      "Authorized creator/admin accounts may review limited user information and chats only for safety, moderation, abuse prevention, support requests, payment verification, bug investigation, legal or policy compliance, and service improvement.",
      "Chat inspection should not be used for unnecessary personal viewing. Creator/admin actions may be logged for security and accountability.",
    ],
  },
  {
    title: "6. Payment Verification",
    body: [
      `Manual UPI payments are sent to ${CREATOR_UPI_ID}. Users must upload a transaction screenshot and enter a transaction ID so the creator can review the request.`,
      "Detox AI will never ask for UPI PIN, OTP, bank password, card PIN, net banking password, or full card details. If anyone asks for these pretending to be Detox AI, do not share them.",
    ],
  },
  {
    title: "7. Sharing of Information",
    body: [
      "We do not sell personal information. We may share limited information with trusted services needed to operate Detox AI, such as authentication, hosting, database, storage, AI processing, analytics, error monitoring, and payment-related services.",
      "We may disclose information if required by law, safety obligations, valid legal requests, or abuse prevention needs.",
    ],
  },
  {
    title: "8. Data Storage and Security",
    body: [
      "We use reasonable measures such as authentication, database rules, server-side API key storage, role-based access control, creator/admin checks, payment verification controls, and usage monitoring.",
      "No online platform can guarantee perfect security. Users should protect their login details and avoid sharing sensitive information in chats.",
    ],
  },
  {
    title: "9. User Rights and Data Retention",
    body: [
      "Users may request access, correction, deletion, or information about their data where applicable. Some records may be retained for security, payment records, moderation logs, legal reasons, or abuse prevention.",
      "Detox AI may offer options to delete chats, rename chats, archive chats, clear chat history, or delete account data where available.",
    ],
  },
  {
    title: "10. Minors, Cookies, and Third-Party Links",
    body: [
      "Students and younger users should use Detox AI with parent or guardian permission where required. Paid services should not be used by minors without appropriate consent.",
      "Detox AI may use cookies or local storage to keep users logged in, save preferences, improve speed, support security, and analyze basic usage.",
      "Third-party links, payment apps, and external services have their own privacy practices. Users should review those policies separately.",
    ],
  },
  {
    title: "11. Contact",
    body: [
      `For privacy questions, support, payment issues, or data requests, contact ${CREATOR_EMAIL}.`,
      "This policy may be updated from time to time. Continued use of Detox AI means you accept the latest version.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="Privacy policy"
      description="Last updated: 30 May 2026. This policy explains how Detox AI collects, uses, stores, protects, and manages user information."
    >
      <div className="grid gap-4">
        {privacySections.map((section) => (
          <section key={section.title} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
