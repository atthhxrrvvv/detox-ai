"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  type User,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Bot, Loader2, Mail } from "lucide-react";
import { CREATOR_EMAIL } from "@/lib/constants";
import { auth, db } from "@/lib/firebase";

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function getFriendlyError(errorValue: unknown) {
    const message = errorValue instanceof Error ? errorValue.message : "Authentication failed.";

    if (message.includes("auth/invalid-credential")) return "Email or password is incorrect.";
    if (message.includes("auth/email-already-in-use")) return "This email already has a Detox AI account.";
    if (message.includes("auth/weak-password")) return "Use a password with at least 6 characters.";
    if (message.includes("auth/popup-closed-by-user")) return "Google login was closed before it finished.";
    if (message.includes("auth/unauthorized-domain")) return "Add this domain in Firebase Authentication settings.";

    return message.replace("Firebase: ", "");
  }

  async function syncUserProfile(user: User) {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: (user.displayName ?? name.trim()) || "Detox User",
        email: user.email,
        photoURL: user.photoURL,
        role: user.email === CREATOR_EMAIL ? "creator" : "free",
        plan: user.email === CREATOR_EMAIL ? "creator" : "free",
        isCreator: user.email === CREATOR_EMAIL,
        isAdmin: user.email === CREATOR_EMAIL,
        isBanned: false,
        blockedPermanently: false,
        lastLogin: serverTimestamp(),
        lastActive: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async function finishAuth(user: User) {
    await syncUserProfile(user);
    router.push("/chat");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      await finishAuth(credential.user);
    } catch (authError) {
      setError(getFriendlyError(authError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let authUser: User;
      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        authUser = credential.user;
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
        authUser = credential.user;
      }

      await finishAuth(authUser);
    } catch (authError) {
      setError(getFriendlyError(authError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">
            <Bot size={20} />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isLogin ? "Welcome back" : "Create your Detox AI account"}
            </h2>
            <p className="text-sm text-slate-400">
              {isLogin ? "Continue your workspace." : "Create your free workspace and start chatting."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
          Continue with Google
        </button>

        <div className="my-5 h-px bg-white/10" />

        <form onSubmit={handleEmailSubmit}>
          {!isLogin ? (
            <>
              <label className="text-sm text-slate-300" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60"
                placeholder="Your name"
              />
            </>
          ) : null}

          <label className={`${isLogin ? "" : "mt-4 block"} text-sm text-slate-300`} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
          />

          <label className="mt-4 block text-sm text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60"
            type="password"
            placeholder="Enter your password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={6}
            required
          />

          {error ? (
            <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            disabled={isLoading}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            {isLogin ? "Login with Email" : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          {isLogin ? "New to Detox AI?" : "Already have an account?"}{" "}
          <Link className="font-semibold text-cyan-100" href={isLogin ? "/signup" : "/login"}>
            {isLogin ? "Create account" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
