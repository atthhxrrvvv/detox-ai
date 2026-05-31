import { PageShell } from "@/components/PageShell";
import { CREATOR_EMAIL, CREATOR_UPI_ID } from "@/lib/constants";

const termsSections = [
  {
    title: "1. About Detox AI",
    body: [
      "Detox AI is an AI assistant platform created and founded by Atharv Sharma. It is designed to help users with chatting, coding, studying, writing, ideas, problem solving, productivity, and other AI-powered tasks.",
      "Detox AI may use third-party AI technology, APIs, hosting services, authentication services, database services, storage services, and payment services to provide its features.",
    ],
  },
  {
    title: "2. Acceptance of Terms",
    body: [
      "By accessing or using Detox AI, you agree to these Terms and Conditions and to the Privacy Policy. If you do not agree, please do not use Detox AI.",
      "You agree to use Detox AI responsibly, legally, and without misusing the platform, AI features, payment system, creator tools, or user accounts.",
      "If you use Detox AI on behalf of another person, business, school, or organization, you confirm that you have permission to do so.",
    ],
  },
  {
    title: "3. Eligibility",
    body: [
      "You may use Detox AI only if you are allowed to use online services under applicable law.",
      "If you are under the age required by law to use digital services independently, you should use Detox AI only with permission from a parent or guardian.",
      "Paid plans, payment submissions, and premium purchases should be made only with proper permission from the account owner, parent, guardian, or authorized payer.",
    ],
  },
  {
    title: "4. Account Registration",
    body: [
      "Some features require an account. When creating an account, you agree to provide accurate information, use your own email address, keep login details safe, and avoid fake, spam, or abusive accounts.",
      "You are responsible for all activity that happens through your account. If you believe your account has been accessed without permission, contact Detox AI support as soon as possible.",
    ],
  },
  {
    title: "5. User Plans",
    body: [
      "Detox AI may offer Free, Lite, Go, Pro, Premium, Ultimate, and Creator access. Each plan may include different features, limits, models, tools, message counts, uploads, response length, and usage permissions.",
      "Detox AI may change plan features, limits, pricing, or availability at any time. Major changes may be shown on the website, pricing page, dashboard, or through an announcement.",
    ],
  },
  {
    title: "6. Free Plan",
    body: [
      "The Free Plan may include access to selected free models and basic features. Free users may have daily limits, monthly limits, limited model access, limited input length, limited chat history, no premium file uploads, no premium models, and no advanced tools.",
      "Free access is provided at the discretion of Detox AI and may be changed, paused, reduced, or removed if needed for safety, cost, or service quality.",
    ],
  },
  {
    title: "7. Paid Plans",
    body: [
      "Lite, Go, Pro, Premium, and Ultimate plans may unlock advanced models, higher limits, longer responses, premium tools, file upload features, priority levels, and other benefits.",
      "Premium and Ultimate models may include Penton 4.4, Titan 5.0, Sentinel 2.7, Prism 3.8, Atlas 4.0, or other models added later.",
      "Paid plans are activated only after successful payment verification or automatic payment confirmation. Detox AI may change paid plan features, model access, limits, or pricing in the future.",
    ],
  },
  {
    title: "8. Creator Access",
    body: [
      "Creator access is reserved for the founder and authorized owner access. The creator account may manage the Creator Dashboard, users, plans, payments, revenue, models, limits, reports, chat moderation tools, app settings, admin logs, and maintenance controls.",
      "Only the authorized creator email may access creator-only features. Unauthorized access to the Creator Dashboard or hidden admin systems is strictly prohibited.",
    ],
  },
  {
    title: "9. Payments",
    body: [
      `Detox AI may support manual UPI payments and may later support payment gateways. For manual UPI payments, users may be asked to pay to ${CREATOR_UPI_ID}.`,
      "After payment, users may need to submit the selected plan, transaction ID, payment screenshot, payment amount, and account email. Payment access may not activate instantly during manual verification.",
      "The creator or authorized admin may approve or reject payment requests after checking the submitted details.",
    ],
  },
  {
    title: "10. Payment Safety",
    body: [
      "Detox AI will never ask for UPI PIN, OTP, bank password, card PIN, net banking password, full card password, or private banking login details.",
      "Users should never share sensitive banking information with Detox AI or anyone pretending to represent Detox AI.",
      "If a user shares incorrect payment information, fake screenshots, edited screenshots, or false transaction details, Detox AI may reject the payment request and may suspend or restrict the account.",
    ],
  },
  {
    title: "11. Refunds",
    body: [
      "Refunds are handled according to the Detox AI Refund Policy. Unless clearly mentioned, payments for digital services, subscriptions, premium access, or manually approved plans may not always be refundable.",
      "Refund requests may be reviewed based on payment status, plan activation status, usage after activation, duplicate payment, wrong plan payment, technical issue, or verification failure.",
      "Detox AI reserves the right to approve or reject refund requests based on the situation and applicable rules.",
    ],
  },
  {
    title: "12. Subscription Expiry",
    body: [
      "Paid access may be valid only for the selected subscription period. After expiry, the account may automatically return to the Free Plan unless renewed.",
      "When a plan expires, the user may lose access to paid models, paid tools, premium limits, and advanced features. Detox AI may show reminders, but renewal is the user's responsibility.",
    ],
  },
  {
    title: "13. AI Models",
    body: [
      "Detox AI may include multiple branded AI models for different purposes, including Cosmo, Gamma, Nova, Flash, Scholar, Spark, Echo, Orion, Penton, Titan, Sentinel, Prism, Atlas, and future models.",
      "These model names are Detox AI branded names. Behind the scenes, Detox AI may use third-party AI providers or backend AI models to generate responses.",
      "Detox AI may add, remove, rename, disable, or modify models at any time.",
    ],
  },
  {
    title: "14. AI Responses",
    body: [
      "AI responses are generated automatically. Detox AI tries to provide helpful, useful, and accurate responses, but AI-generated content may be incorrect, incomplete, outdated, misunderstood, unsuitable, or different from what the user expected.",
      "Users should verify important information before relying on it. Detox AI should not be used as the only source for serious decisions.",
    ],
  },
  {
    title: "15. No Professional Advice",
    body: [
      "Detox AI may provide general information, explanations, and suggestions, but it does not replace qualified professionals.",
      "Do not rely only on Detox AI for medical, legal, financial, emergency, safety-critical, mental health crisis, professional diagnosis, government, or official compliance decisions. Contact a qualified professional or trusted official source for important matters.",
    ],
  },
  {
    title: "16. User Content",
    body: [
      "Users may submit prompts, messages, files, text, code, images, documents, or other content to Detox AI. You are responsible for the content you submit.",
      "Do not submit content that you do not have permission to use, violates another person's rights, contains private information without permission, contains illegal material, includes harmful instructions, is abusive or harassing, attempts to exploit systems, or attempts to bypass restrictions.",
      "By submitting content, you give Detox AI permission to process that content to provide the service.",
    ],
  },
  {
    title: "17. Prohibited Uses",
    body: [
      "You agree not to use Detox AI for illegal activity, harassment, threats, spam, scams, fake identities for harm, account theft, hacking, unauthorized access, malware, phishing, cyber abuse, bypassing safety systems, privacy violations, harmful instructions, payment misuse, fake payment proofs, system overload, reverse engineering, or copying Detox AI branding without permission.",
      "Detox AI may suspend, restrict, or ban accounts that violate these rules.",
    ],
  },
  {
    title: "18. Coding and Technical Help",
    body: [
      "Detox AI may help with coding, debugging, app development, website development, and technical learning.",
      "Users are responsible for reviewing, testing, and securing any code generated by Detox AI. Detox AI is not responsible for broken code, data loss, security bugs, deployment issues, API costs, third-party service problems, misuse of generated code, or damage caused by untested code.",
    ],
  },
  {
    title: "19. File Uploads",
    body: [
      "If file uploads are available, users are responsible for uploaded files. Do not upload files you do not own, private documents without permission, malware, illegal content, highly sensitive personal information, passwords, secret keys, or private credentials.",
      "Detox AI may process uploaded files to answer questions, summarize content, extract text, or provide AI assistance. Files may be stored, deleted, limited, or restricted based on plan limits and platform rules.",
    ],
  },
  {
    title: "20. Chat History",
    body: [
      "Detox AI may save chats and messages so users can access previous conversations. Users may be given options to view, rename, delete, archive, export, or report chats.",
      "Deleted chats may not always be recoverable. Some records may be retained for security, moderation, payment, legal, or technical reasons.",
    ],
  },
  {
    title: "21. Moderation and Admin Review",
    body: [
      "Detox AI may include moderation and creator/admin review tools. Authorized creator/admin accounts may review limited user information, reports, payment submissions, and chats only when needed for safety, moderation, abuse prevention, support, payment verification, bug investigation, legal compliance, or service improvement.",
      "Admin review should not be used for unnecessary personal viewing. Creator/admin actions may be recorded in audit logs.",
    ],
  },
  {
    title: "22. Reports and Abuse Prevention",
    body: [
      "Users may report wrong, unsafe, abusive, or problematic content. Detox AI may review reports and take actions such as marking reports reviewed, removing harmful content, warning users, restricting users, banning users, or improving safety systems.",
      "False reporting or abuse of the reporting system may lead to account restrictions.",
    ],
  },
  {
    title: "23. Account Suspension and Termination",
    body: [
      "Detox AI may suspend, restrict, or terminate accounts if users violate these Terms, misuse the platform, submit fake payments, abuse other users, attempt unauthorized access, break safety rules, use the platform illegally, create spam accounts, or try to damage Detox AI systems.",
      "Detox AI may also suspend features temporarily for maintenance, security, or technical reasons.",
    ],
  },
  {
    title: "24. Service Availability",
    body: [
      "Detox AI may not always be available. The service may be interrupted due to maintenance, updates, server issues, API provider issues, database issues, payment provider issues, internet problems, security reasons, or unexpected technical errors.",
      "Detox AI does not guarantee that the service will always be error-free, uninterrupted, or available at all times.",
    ],
  },
  {
    title: "25. Third-Party Services",
    body: [
      "Detox AI may use third-party services for AI responses, hosting, authentication, database, storage, payments, analytics, error monitoring, email, or notifications.",
      "Third-party services may have their own terms and privacy policies. Detox AI is not responsible for problems caused by third-party platforms outside its control.",
    ],
  },
  {
    title: "26. Intellectual Property",
    body: [
      "The Detox AI name, branding, design, logo, model names, interface, content structure, and platform features belong to Detox AI or its creator unless otherwise stated.",
      "Users may not copy, sell, clone, misuse, or represent Detox AI branding as their own without permission.",
      "Users own the original content they submit, but allow Detox AI to process it to provide the service. AI-generated outputs may be used by users, but users are responsible for checking whether their use is legal, safe, and appropriate.",
    ],
  },
  {
    title: "27. Feedback and Suggestions",
    body: [
      "Users may share feedback, ideas, bug reports, or feature suggestions. By submitting feedback, you allow Detox AI to use it to improve the platform without compensation.",
      "Feedback may be used for UI/UX, models, tools, pricing, dashboard features, safety systems, creator dashboard, and payment flow improvements.",
    ],
  },
  {
    title: "28. Privacy",
    body: [
      "Your use of Detox AI is also governed by the Privacy Policy, which explains how Detox AI collects, uses, stores, and protects user information.",
      "By using Detox AI, you also agree to the Privacy Policy.",
    ],
  },
  {
    title: "29. Changes to Features",
    body: [
      "Detox AI may update, improve, add, remove, rename, or change features at any time, including AI models, tools, pricing, plans, limits, payment methods, dashboards, chat features, file uploads, UI design, and security systems.",
      "Detox AI may make changes without prior notice when needed for safety, security, performance, or product improvement.",
    ],
  },
  {
    title: "30. Changes to These Terms",
    body: [
      "Detox AI may update these Terms and Conditions from time to time. When changes are made, the Last Updated date may change.",
      "Continued use of Detox AI after changes means you accept the updated Terms. If you do not agree, you should stop using Detox AI.",
    ],
  },
  {
    title: "31. Limitation of Liability",
    body: [
      "To the maximum extent allowed by law, Detox AI and its creator are not responsible for loss of data, loss of money, wrong AI responses, business losses, academic losses, project errors, code errors, payment mistakes caused by incorrect user details, third-party service failures, user misuse of AI-generated content, or unauthorized account use caused by user negligence.",
      "Users use Detox AI at their own responsibility.",
    ],
  },
  {
    title: "32. Disclaimer",
    body: [
      "Detox AI is provided on an as available and as is basis. We try to make the platform useful, safe, and reliable, but we do not guarantee perfect accuracy, uninterrupted access, or error-free performance.",
      "AI-generated responses should always be reviewed before being used for important work.",
    ],
  },
  {
    title: "33. Governing Law",
    body: [
      "These Terms and Conditions are governed by the laws of India. Any disputes may be handled under applicable Indian laws.",
      "Where legally allowed, disputes may be subject to the courts or authorities having jurisdiction in Bengaluru, Karnataka, India.",
    ],
  },
  {
    title: "34. Contact Information",
    body: [
      `For support, payment issues, privacy requests, or questions about these Terms, contact ${CREATOR_EMAIL}.`,
      `Payment UPI ID: ${CREATOR_UPI_ID}.`,
    ],
  },
  {
    title: "35. Final Note",
    body: [
      "Detox AI is built to help users think, learn, code, write, create, and solve problems better.",
      "Users are expected to use Detox AI responsibly, respectfully, and legally. By using Detox AI, you agree to follow these Terms and Conditions.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms"
      title="Terms and conditions"
      description="Last updated: 30 May 2026. These terms explain the rules for using Detox AI, including chat, tools, plans, creator controls, payments, uploads, and AI-generated responses."
    >
      <div className="grid gap-4">
        {termsSections.map((section) => (
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
