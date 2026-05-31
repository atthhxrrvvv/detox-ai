"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";
import { Camera, Check, Crown, Save, Shield, Sparkles, UserRound } from "lucide-react";
import { auth } from "@/lib/firebase";

type SavedProfile = {
  name: string;
  email: string;
  photoURL: string;
  bio: string;
  defaultModel: string;
  tone: string;
  occupation: string;
};

const defaultProfile: SavedProfile = {
  name: "Detox User",
  email: "",
  photoURL: "",
  bio: "I use Detox AI for studying, coding, writing, and building projects.",
  defaultModel: "flash-1.0",
  tone: "Professional and clear",
  occupation: "Student / Creator",
};

export function ProfileSettings() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SavedProfile>(() => {
    if (typeof window === "undefined") return defaultProfile;

    try {
      const saved = window.localStorage.getItem("detox-profile");
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setProfile((current) => ({
          ...current,
          name: user.displayName || current.name,
          email: user.email || current.email,
          photoURL: user.photoURL || current.photoURL,
        }));
      }
    });
  }, []);

  const initials = useMemo(() => {
    return profile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.name]);

  async function saveProfile() {
    setIsSaving(true);
    setStatus("");

    try {
      window.localStorage.setItem("detox-profile", JSON.stringify(profile));

      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: profile.name,
          photoURL: profile.photoURL || null,
        });
      }

      setStatus("Profile saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
      <section className="glass rounded-3xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="grid size-28 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/8 text-3xl font-semibold text-white">
              {profile.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoURL} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                initials || <UserRound size={36} />
              )}
            </div>
            <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full border border-white/10 bg-cyan-300 text-slate-950">
              <Camera size={16} />
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">{profile.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{profile.email || "Not signed in yet"}</p>
          <div className="mt-5 grid w-full grid-cols-3 gap-2">
            {[
              ["Plan", "Free"],
              ["Role", "User"],
              ["Mode", "Clean"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit profile</h2>
            <p className="mt-1 text-sm text-slate-400">Personalize how Detox AI knows you.</p>
          </div>
          <span className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 sm:inline-flex">
            Professional profile
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300" htmlFor="profile-name">
            Display name
            <input
              id="profile-name"
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-300/60"
            />
          </label>
          <label className="text-sm text-slate-300" htmlFor="profile-email">
            Email
            <input
              id="profile-email"
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-300/60"
              type="email"
            />
          </label>
          <label className="text-sm text-slate-300 sm:col-span-2" htmlFor="profile-photo">
            Photo URL
            <input
              id="profile-photo"
              value={profile.photoURL}
              onChange={(event) => setProfile({ ...profile, photoURL: event.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-300/60"
              placeholder="https://..."
            />
          </label>
          <label className="text-sm text-slate-300" htmlFor="profile-occupation">
            Occupation
            <input
              id="profile-occupation"
              value={profile.occupation}
              onChange={(event) => setProfile({ ...profile, occupation: event.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-300/60"
            />
          </label>
          <label className="text-sm text-slate-300" htmlFor="profile-model">
            Default model
            <select
              id="profile-model"
              value={profile.defaultModel}
              onChange={(event) => setProfile({ ...profile, defaultModel: event.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-300/60"
            >
              <option value="flash-1.0">Flash 1.0</option>
              <option value="scholar-1.4">Scholar 1.4</option>
              <option value="spark-1.8">Spark 1.8</option>
              <option value="echo-1.6">Echo 1.6</option>
              <option value="nova-1.5">Nova 1.5</option>
              <option value="cosmo-1.2">Cosmo 1.2</option>
              <option value="gamma-2.0">Gamma 2.0</option>
              <option value="orion-2.9">Orion 2.9</option>
            </select>
          </label>
          <label className="text-sm text-slate-300 sm:col-span-2" htmlFor="profile-tone">
            How should Detox AI respond?
            <input
              id="profile-tone"
              value={profile.tone}
              onChange={(event) => setProfile({ ...profile, tone: event.target.value })}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-300/60"
            />
          </label>
          <label className="text-sm text-slate-300 sm:col-span-2" htmlFor="profile-bio">
            About you
            <textarea
              id="profile-bio"
              aria-label="About you"
              value={profile.bio}
              onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
              className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-cyan-300/60"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-70"
          >
            {isSaving ? <Sparkles className="animate-spin" size={16} /> : <Save size={16} />}
            Save profile
          </button>
          {status ? (
            <p className="inline-flex items-center gap-2 text-sm text-emerald-200">
              <Check size={16} />
              {status}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Crown className="text-amber-100" size={18} />
            <p className="mt-3 text-sm font-semibold text-white">Upgrade ready</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Plan badges and model locks connect to your profile state later.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Shield className="text-cyan-100" size={18} />
            <p className="mt-3 text-sm font-semibold text-white">Private by design</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Only authorized review for support, safety, and moderation.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <UserRound className="text-violet-100" size={18} />
            <p className="mt-3 text-sm font-semibold text-white">Yourself memory</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Save your tone, role, and context for a more personal assistant.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
