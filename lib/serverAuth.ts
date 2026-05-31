export type VerifiedFirebaseUser = {
  email: string | null;
  uid: string;
};

type FirebaseLookupResponse = {
  users?: Array<{
    email?: string;
    localId?: string;
  }>;
  error?: {
    message?: string;
  };
};

export async function verifyFirebaseIdToken(idToken?: string | null): Promise<VerifiedFirebaseUser | null> {
  if (!idToken) return null;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as FirebaseLookupResponse;
  const user = data.users?.[0];
  if (!user?.localId) return null;

  return {
    email: user.email ?? null,
    uid: user.localId,
  };
}
