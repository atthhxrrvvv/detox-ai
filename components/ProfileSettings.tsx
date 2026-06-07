"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { deleteUser, onAuthStateChanged, signOut, updateProfile, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  AlertTriangle,
  Check,
  Crown,
  Database,
  Download,
  Github,
  Globe,
  Instagram,
  Loader2,
  LogOut,
  Pencil,
  RefreshCcw,
  Save,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Youtube,
} from "lucide-react";
import { CREATOR_EMAIL } from "@/lib/constants";
import { auth, db, storage } from "@/lib/firebase";
import { PLAN_LIMITS, type PlanId } from "@/lib/limits";
import { DETOX_MODELS } from "@/lib/models";

type FirestoreDateLike = {
  toDate?: () => Date;
};

type SocialLinks = {
  instagram: string;
  youtube: string;
  github: string;
  website: string;
};

type SavedProfile = {
  uid: string;
  name: string;
  username: string;
  email: string;
  photoURL: string;
  bio: string;
  occupation: string;
  defaultModel: string;
  responseStyle: string;
  defaultTheme: string;
  language: string;
  socialLinks: SocialLinks;
  role: string;
  plan: PlanId;
  isCreator: boolean;
  dailyMessages: number;
  monthlyMessages: number;
  totalMessages: number;
  tokensUsed: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLogin: Date | null;
  premiumUntil: Date | null;
  proUntil: Date | null;
  planExpiresAt: Date | null;
};

const CHAT_STORAGE_KEY = "detox-ai-working-chats";
const PROFILE_STORAGE_KEY = "detox-profile";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const defaultSocialLinks: SocialLinks = {
  instagram: "",
  youtube: "",
  github: "",
  website: "",
};

const defaultProfile: SavedProfile = {
  uid: "",
  name: "Detox User",
  username: "detox_user",
  email: "",
  photoURL: "",
  bio: "I use Detox AI for studying, coding, writing, and building projects.",
  occupation: "Student / Creator",
  defaultModel: "flash-1.0",
  responseStyle: "Professional and clear",
  defaultTheme: "Dark Premium",
  language: "English",
  socialLinks: defaultSocialLinks,
  role: "free",
  plan: "free",
  isCreator: false,
  dailyMessages: 0,
  monthlyMessages: 0,
  totalMessages: 0,
  tokensUsed: 0,
  createdAt: null,
  updatedAt: null,
  lastLogin: null,
  premiumUntil: null,
  proUntil: null,
  planExpiresAt: null,
};

const responseStyles = [
  "Professional and clear",
  "Simple and friendly",
  "Detailed step by step",
  "Fast and direct",
  "Creative and polished",
];

const themes = ["Dark Premium", "Clean Blue", "Creator Glow", "Minimal"];
const languages = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Malayalam", "Spanish", "French"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (isRecord(value) && typeof (value as FirestoreDateLike).toDate === "function") {
    return (value as FirestoreDateLike).toDate?.() ?? null;
  }
  return null;
}

function toStorageDate(value: Date | null) {
  return value?.toISOString() ?? null;
}

function profileToLocalStorage(profile: SavedProfile) {
  return {
    ...profile,
    createdAt: toStorageDate(profile.createdAt),
    updatedAt: toStorageDate(profile.updatedAt),
    lastLogin: toStorageDate(profile.lastLogin),
    premiumUntil: toStorageDate(profile.premiumUntil),
    proUntil: toStorageDate(profile.proUntil),
    planExpiresAt: toStorageDate(profile.planExpiresAt),
  };
}

function normalizePlan(value: unknown, email?: string | null): PlanId {
  if (email === CREATOR_EMAIL) return "creator";
  const plan = asString(value, "free").toLowerCase();
  return plan in PLAN_LIMITS ? (plan as PlanId) : "free";
}

function usernameFromUser(user: User) {
  const base = user.email?.split("@")[0] || user.displayName || "detox_user";
  return base.toLowerCase().replace(/[^a-z0-9._-]/g, "_").slice(0, 24) || "detox_user";
}

function dateLabel(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getPlanBadge(plan: PlanId, isCreator: boolean) {
  if (isCreator || plan === "creator") {
    return {
      label: "Creator Mode",
      className: "border-amber-300/40 bg-violet-500/15 text-amber-100",
    };
  }
  if (plan === "premium" || plan === "ultimate") {
    return {
      label: plan === "ultimate" ? "Ultimate Plan" : "Premium Plan",
      className: "border-amber-300/35 bg-amber-300/12 text-amber-100",
    };
  }
  if (plan === "pro" || plan === "go" || plan === "lite") {
    return {
      label: `${plan[0].toUpperCase()}${plan.slice(1)} Plan`,
      className: "border-blue-300/30 bg-blue-400/12 text-blue-100",
    };
  }
  return {
    label: "Free Plan",
    className: "border-slate-300/20 bg-slate-400/10 text-slate-200",
  };
}

function getAvatarGlow(plan: PlanId, isCreator: boolean) {
  if (isCreator || plan === "creator") return "bg-gradient-to-br from-amber-200 via-violet-300 to-cyan-200 shadow-[0_0_58px_rgba(251,191,36,0.42)]";
  if (plan === "ultimate") return "bg-[conic-gradient(from_0deg,#a855f7,#06b6d4,#22c55e,#f59e0b,#a855f7)] shadow-[0_0_54px_rgba(168,85,247,0.34)]";
  if (plan === "premium") return "bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-300 shadow-[0_0_52px_rgba(251,191,36,0.34)]";
  if (plan === "pro") return "bg-gradient-to-br from-blue-300 via-blue-500 to-indigo-400 shadow-[0_0_48px_rgba(59,130,246,0.32)]";
  if (plan === "go") return "bg-gradient-to-br from-cyan-200 via-cyan-400 to-teal-300 shadow-[0_0_44px_rgba(34,211,238,0.28)]";
  if (plan === "lite") return "bg-gradient-to-br from-sky-300 to-blue-500 shadow-[0_0_38px_rgba(14,165,233,0.24)]";
  return "bg-gradient-to-br from-slate-500 to-slate-300 shadow-[0_0_28px_rgba(148,163,184,0.18)]";
}

function planExpiryProgress(plan: PlanId, expiresAt: Date | null, isCreator: boolean) {
  if (isCreator || plan === "creator") {
    return { label: "Creator Active", detail: "Unlimited", progress: 100 };
  }
  if (plan === "free") {
    return { label: "Free Active", detail: "No expiry", progress: 100 };
  }
  if (!expiresAt) {
    return { label: `${plan[0].toUpperCase()}${plan.slice(1)} Active`, detail: "Expiry not set", progress: 100 };
  }

  const totalMs = 30 * 24 * 60 * 60 * 1000;
  const remainingMs = Math.max(0, expiresAt.getTime() - Date.now());
  const daysLeft = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  return {
    label: `${plan[0].toUpperCase()}${plan.slice(1)} Active`,
    detail: `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`,
    progress: Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)),
  };
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "DU";
  return source
    .split(/\s+|[._-]/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function createProfileFromUser(user: User, stored?: Partial<SavedProfile>): SavedProfile {
  const isCreator = user.email === CREATOR_EMAIL;
  return {
    ...defaultProfile,
    ...stored,
    uid: user.uid,
    name: user.displayName || stored?.name || defaultProfile.name,
    username: stored?.username || usernameFromUser(user),
    email: user.email || stored?.email || "",
    photoURL: user.photoURL || stored?.photoURL || "",
    role: isCreator ? "creator" : stored?.role || "free",
    plan: normalizePlan(stored?.plan, user.email),
    isCreator,
    socialLinks: { ...defaultSocialLinks, ...stored?.socialLinks },
  };
}

function createProfileFromFirestore(user: User, data: Record<string, unknown>): SavedProfile {
  const storedSocials = isRecord(data.socialLinks) ? data.socialLinks : {};
  const isCreator = user.email === CREATOR_EMAIL || Boolean(data.isCreator);
  return {
    ...createProfileFromUser(user),
    name: asString(data.name, user.displayName || defaultProfile.name),
    username: asString(data.username, usernameFromUser(user)),
    email: user.email || asString(data.email),
    photoURL: asString(data.photoURL, user.photoURL || ""),
    bio: asString(data.bio, defaultProfile.bio),
    occupation: asString(data.occupation, defaultProfile.occupation),
    defaultModel: asString(data.defaultModel, defaultProfile.defaultModel),
    responseStyle: asString(data.responseStyle, asString(data.tone, defaultProfile.responseStyle)),
    defaultTheme: asString(data.defaultTheme, defaultProfile.defaultTheme),
    language: asString(data.language, defaultProfile.language),
    socialLinks: {
      instagram: asString(storedSocials.instagram),
      youtube: asString(storedSocials.youtube),
      github: asString(storedSocials.github),
      website: asString(storedSocials.website),
    },
    role: isCreator ? "creator" : asString(data.role, "free"),
    plan: normalizePlan(data.plan, user.email),
    isCreator,
    dailyMessages: asNumber(data.dailyMessages),
    monthlyMessages: asNumber(data.monthlyMessages),
    totalMessages: asNumber(data.totalMessages),
    tokensUsed: asNumber(data.tokensUsed),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
    lastLogin: asDate(data.lastLogin),
    premiumUntil: asDate(data.premiumUntil),
    proUntil: asDate(data.proUntil),
    planExpiresAt: asDate(data.planExpiresAt),
  };
}

function mergeLocalProfile(user: User) {
  if (typeof window === "undefined") return createProfileFromUser(user);

  try {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return createProfileFromUser(user);
    const parsed = JSON.parse(saved) as Partial<SavedProfile>;
    return createProfileFromUser(user, {
      ...parsed,
      createdAt: asDate(parsed.createdAt),
      updatedAt: asDate(parsed.updatedAt),
      lastLogin: asDate(parsed.lastLogin),
      premiumUntil: asDate(parsed.premiumUntil),
      proUntil: asDate(parsed.proUntil),
      planExpiresAt: asDate(parsed.planExpiresAt),
    });
  } catch {
    return createProfileFromUser(user);
  }
}

async function cropImageToSquare(file: File, zoom: number) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return file;

    const sourceSize = Math.min(image.width, image.height) / zoom;
    const sx = (image.width - sourceSize) / 2;
    const sy = (image.height - sourceSize) / 2;
    context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ?? file), "image/webp", 0.92);
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label className="text-sm font-medium text-slate-300" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  id: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:text-slate-500"
      placeholder={placeholder}
      type={type}
      disabled={disabled}
    />
  );
}

function SelectInput({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none transition focus:border-cyan-300/60"
    >
      {children}
    </select>
  );
}

export function ProfileSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SavedProfile>(defaultProfile);
  const [lastSavedProfile, setLastSavedProfile] = useState<SavedProfile>(defaultProfile);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);

      if (!user) {
        setProfile(defaultProfile);
        setLastSavedProfile(defaultProfile);
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      const fallbackProfile = mergeLocalProfile(user);
      setProfile(fallbackProfile);
      setLastSavedProfile(fallbackProfile);

      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        const firestoreProfile = snapshot.exists()
          ? createProfileFromFirestore(user, snapshot.data())
          : fallbackProfile;
        setProfile(firestoreProfile);
        setLastSavedProfile(firestoreProfile);
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToLocalStorage(firestoreProfile)));
      } catch (profileError) {
        console.warn("Could not load Firestore profile.", profileError);
      } finally {
        setIsLoadingProfile(false);
      }
    });
  }, []);

  const initials = useMemo(() => getInitials(profile.name, profile.email), [profile.name, profile.email]);
  const planBadge = getPlanBadge(profile.plan, profile.isCreator);
  const avatarGlow = getAvatarGlow(profile.plan, profile.isCreator);
  const planLimits = PLAN_LIMITS[profile.plan] ?? PLAN_LIMITS.free;
  const defaultModel = DETOX_MODELS.find((model) => model.id === profile.defaultModel) ?? DETOX_MODELS[0];
  const planExpiry = profile.planExpiresAt ?? profile.premiumUntil ?? profile.proUntil;
  const expiry = planExpiryProgress(profile.plan, planExpiry, profile.isCreator);
  const avatarSource = removeAvatar ? "" : avatarPreview || profile.photoURL;
  const isDirty = JSON.stringify(profileToLocalStorage(profile)) !== JSON.stringify(profileToLocalStorage(lastSavedProfile)) || Boolean(avatarFile) || removeAvatar;

  function updateProfileField<K extends keyof SavedProfile>(key: K, value: SavedProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateSocialLink(key: keyof SocialLinks, value: string) {
    setProfile((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [key]: value,
      },
    }));
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");
    setStatus("");

    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarFile(null);
      setAvatarPreview("");
      setError("Upload JPG, PNG, or WebP for your profile picture.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarFile(null);
      setAvatarPreview("");
      setError("Profile picture must be under 5 MB.");
      return;
    }

    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarZoom(1);
    setRemoveAvatar(false);
  }

  function cancelChanges() {
    setProfile(lastSavedProfile);
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(false);
    setAvatarZoom(1);
    setStatus("");
    setError("");
  }

  async function uploadAvatar(user: User) {
    if (removeAvatar) {
      try {
        await deleteObject(ref(storage, `profilePictures/${user.uid}/avatar`));
      } catch {
        // The file may not exist yet, so removing the profile URL is enough.
      }
      return "";
    }

    if (!avatarFile) return profile.photoURL;

    const avatarBlob = await cropImageToSquare(avatarFile, avatarZoom);
    const avatarRef = ref(storage, `profilePictures/${user.uid}/avatar`);
    await uploadBytes(avatarRef, avatarBlob, {
      contentType: "image/webp",
      customMetadata: {
        userId: user.uid,
        originalName: avatarFile.name,
      },
    });
    return getDownloadURL(avatarRef);
  }

  async function saveProfile() {
    setError("");
    setStatus("");

    if (!firebaseUser) {
      setError("Login first to update your profile.");
      return;
    }

    const cleanUsername = profile.username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(cleanUsername)) {
      setError("Username must be 3-24 characters using letters, numbers, dots, dashes, or underscores.");
      return;
    }

    setIsSaving(true);

    try {
      const photoURL = await uploadAvatar(firebaseUser);
      const nextProfile = {
        ...profile,
        username: cleanUsername,
        email: firebaseUser.email || profile.email,
        photoURL,
        updatedAt: new Date(),
      };

      await updateProfile(firebaseUser, {
        displayName: nextProfile.name.trim() || "Detox User",
        photoURL: photoURL || null,
      });

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          uid: firebaseUser.uid,
          name: nextProfile.name.trim() || "Detox User",
          username: cleanUsername,
          email: firebaseUser.email,
          photoURL,
          bio: nextProfile.bio.trim(),
          occupation: nextProfile.occupation.trim(),
          defaultModel: nextProfile.defaultModel,
          responseStyle: nextProfile.responseStyle,
          defaultTheme: nextProfile.defaultTheme,
          language: nextProfile.language,
          socialLinks: nextProfile.socialLinks,
          updatedAt: serverTimestamp(),
          createdAt: nextProfile.createdAt ?? serverTimestamp(),
        },
        { merge: true },
      );

      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToLocalStorage(nextProfile)));
      setProfile(nextProfile);
      setLastSavedProfile(nextProfile);
      setAvatarFile(null);
      setAvatarPreview("");
      setRemoveAvatar(false);
      setStatus("Profile updated successfully.");
    } catch (profileError) {
      console.error(profileError);
      setError("Something went wrong while updating your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function clearChatHistory() {
    if (!window.confirm("Clear all chats for this signed-in account?")) return;
    window.localStorage.removeItem(CHAT_STORAGE_KEY);

    if (!firebaseUser) {
      setStatus("Local chat history cleared on this browser.");
      setError("");
      return;
    }

    try {
      const snapshot = await getDocs(query(collection(db, "chats"), where("userId", "==", firebaseUser.uid)));
      const batch = writeBatch(db);
      snapshot.forEach((chatDoc) => {
        batch.set(
          chatDoc.ref,
          {
            isDeleted: true,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
      await batch.commit();
      window.localStorage.removeItem(`${CHAT_STORAGE_KEY}-${firebaseUser.uid}`);
      setStatus("Chat history cleared for this account.");
    } catch {
      setError("Could not clear cloud chats right now. Try again after checking Firebase rules.");
      return;
    }

    setError("");
  }

  function exportData() {
    const data = {
      profile: profileToLocalStorage(profile),
      localChats: (() => {
        try {
          return JSON.parse(window.localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
        } catch {
          return [];
        }
      })(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `detox-ai-profile-${profile.username || "user"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Export ready.");
    setError("");
  }

  async function deleteAccount() {
    if (!firebaseUser) {
      setError("Login first to delete your account.");
      return;
    }
    if (!window.confirm("Delete this Firebase account? You may need to login again first for security.")) return;

    try {
      await deleteUser(firebaseUser);
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      setStatus("Account deleted.");
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "";
      setError(message.includes("requires-recent-login") ? "Login again, then delete the account." : "Could not delete account.");
    }
  }

  async function logout() {
    await signOut(auth);
  }

  if (!isAuthReady || isLoadingProfile) {
    return (
      <div className="glass flex min-h-80 items-center justify-center rounded-3xl p-8 text-slate-300">
        <Loader2 className="mr-3 animate-spin text-cyan-100" size={20} />
        Loading profile settings...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full border border-white/10 bg-white/8 text-cyan-100">
          <UserRound size={26} />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-white">Login to edit your profile</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Profile settings are connected to your Detox AI account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="glass overflow-hidden rounded-3xl">
          <div className="relative p-6">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-cyan-400/16 via-violet-400/12 to-amber-300/14" />
            <div className="relative flex flex-col items-center text-center">
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
              <div className="relative">
                <div className={`rounded-full p-1.5 ${avatarGlow}`}>
                  <div className="grid size-32 place-items-center overflow-hidden rounded-full border border-black/30 bg-[#020713] text-4xl font-semibold text-white">
                    {avatarSource ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSource}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                        style={{ transform: avatarPreview ? `scale(${avatarZoom})` : undefined }}
                      />
                    ) : (
                      initials || <UserRound size={42} />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 grid size-10 place-items-center rounded-full border border-white/20 bg-cyan-300 text-slate-950 shadow-lg transition hover:bg-cyan-200"
                  aria-label="Change photo"
                >
                  <Pencil size={16} />
                </button>
              </div>

              <h2 className="mt-4 text-2xl font-semibold text-white">{profile.name || "Detox User"}</h2>
              <p className="mt-1 text-sm text-slate-400">@{profile.username || "detox_user"}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${planBadge.className}`}>
                  <Crown size={14} />
                  {planBadge.label}
                </span>
                {profile.isCreator ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                    <Sparkles size={14} />
                    Unlimited Access
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div
                  className="grid size-20 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(rgb(34 211 238) ${expiry.progress * 3.6}deg, rgb(30 41 59) 0deg)`,
                  }}
                  aria-label={`${expiry.label}, ${expiry.detail}`}
                >
                  <div className="grid size-[4.25rem] place-items-center rounded-full bg-[#07111f]">
                    <Crown size={20} className="text-amber-100" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">{expiry.label}</p>
                  <p className="mt-1 text-sm text-cyan-100">{expiry.detail}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {planExpiry ? `Expires ${dateLabel(planExpiry)}` : "Plan status synced from your profile."}
                  </p>
                </div>
              </div>

              {avatarPreview ? (
                <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="avatar-zoom">
                    Crop zoom
                  </label>
                  <input
                    id="avatar-zoom"
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={avatarZoom}
                    onChange={(event) => setAvatarZoom(Number(event.target.value))}
                    className="mt-3 w-full accent-cyan-300"
                  />
                </div>
              ) : null}

              <div className="mt-5 grid w-full grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Today</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {profile.isCreator ? "Unlimited" : `${formatNumber(profile.dailyMessages)} / ${formatNumber(planLimits.dailyMessages)}`}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Month</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {profile.isCreator ? "Unlimited" : `${formatNumber(profile.monthlyMessages)} / ${formatNumber(planLimits.monthlyMessages)}`}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Model</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">{defaultModel.displayName}</p>
                </div>
              </div>

              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Upload size={16} />
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview("");
                    setRemoveAvatar(true);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  <RefreshCcw size={16} />
                  Remove Photo
                </button>
              </div>

              {profile.isCreator ? (
                <Link
                  href="/creator"
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 to-cyan-200 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  <Crown size={16} />
                  Creator Dashboard
                </Link>
              ) : null}

            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
              <p className="mt-1 text-sm text-slate-400">Customize your Detox AI identity and preferences.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelChanges}
                disabled={!isDirty || isSaving}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={!isDirty || isSaving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>

          {status ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
              <Check size={16} />
              {status}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              <AlertTriangle size={16} />
              {error}
            </p>
          ) : null}

          <div className="mt-6 space-y-7">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">Personal Information</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="profile-name">Display Name</FieldLabel>
                  <TextInput id="profile-name" value={profile.name} onChange={(value) => updateProfileField("name", value)} />
                </div>
                <div>
                  <FieldLabel htmlFor="profile-username">Username</FieldLabel>
                  <TextInput id="profile-username" value={profile.username} onChange={(value) => updateProfileField("username", value)} placeholder="atharv" />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                  <textarea
                    id="profile-bio"
                    value={profile.bio}
                    onChange={(event) => updateProfileField("bio", event.target.value)}
                    className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                    placeholder="Personalize how Detox AI works for you."
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="profile-occupation">Occupation / Role</FieldLabel>
                  <TextInput id="profile-occupation" value={profile.occupation} onChange={(value) => updateProfileField("occupation", value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">AI Preferences</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="profile-model">Default AI Model</FieldLabel>
                  <SelectInput id="profile-model" value={profile.defaultModel} onChange={(value) => updateProfileField("defaultModel", value)}>
                    {DETOX_MODELS.filter((model) => model.enabled).map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.displayName} - {model.access}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel htmlFor="profile-style">Response Style</FieldLabel>
                  <SelectInput id="profile-style" value={profile.responseStyle} onChange={(value) => updateProfileField("responseStyle", value)}>
                    {responseStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel htmlFor="profile-theme">Default Theme</FieldLabel>
                  <SelectInput id="profile-theme" value={profile.defaultTheme} onChange={(value) => updateProfileField("defaultTheme", value)}>
                    {themes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div>
                  <FieldLabel htmlFor="profile-language">Default Language</FieldLabel>
                  <SelectInput id="profile-language" value={profile.language} onChange={(value) => updateProfileField("language", value)}>
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">Social Links</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="profile-instagram">Instagram</FieldLabel>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-[1.05rem] text-slate-500" size={16} />
                    <input
                      id="profile-instagram"
                      value={profile.socialLinks.instagram}
                      onChange={(event) => updateSocialLink("instagram", event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="profile-youtube">YouTube</FieldLabel>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-[1.05rem] text-slate-500" size={16} />
                    <input
                      id="profile-youtube"
                      value={profile.socialLinks.youtube}
                      onChange={(event) => updateSocialLink("youtube", event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="profile-github">GitHub</FieldLabel>
                  <div className="relative">
                    <Github className="absolute left-3 top-[1.05rem] text-slate-500" size={16} />
                    <input
                      id="profile-github"
                      value={profile.socialLinks.github}
                      onChange={(event) => updateSocialLink("github", event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="profile-website">Website</FieldLabel>
                  <div className="relative">
                    <Globe className="absolute left-3 top-[1.05rem] text-slate-500" size={16} />
                    <input
                      id="profile-website"
                      value={profile.socialLinks.website}
                      onChange={(event) => updateSocialLink("website", event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white">Account Information</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Email", profile.email || "Not available"],
              ["Plan", planBadge.label],
              ["Role", profile.role || "user"],
              ["Joined", dateLabel(profile.createdAt)],
              ["Default Model", defaultModel.displayName],
              ["Plan Expiry", dateLabel(planExpiry)],
              ["Total Messages", formatNumber(profile.totalMessages)],
              ["Tokens Used", formatNumber(profile.tokensUsed)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white">Privacy and Data</h2>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={exportData}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Download size={16} />
              Export Data
            </button>
            <button
              type="button"
              onClick={clearChatHistory}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Database size={16} />
              Clear Chat History
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="glass rounded-3xl border-red-300/20 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-100">
              <Shield size={14} />
              Danger Zone
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Delete account</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              This action removes the Firebase login account. Some saved app records may remain for security, payment, or support history.
            </p>
          </div>
          <button
            type="button"
            onClick={deleteAccount}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-400 px-5 text-sm font-semibold text-white transition hover:bg-red-300"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
