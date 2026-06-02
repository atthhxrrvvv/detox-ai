import { jsonError } from "@/lib/api";

export type FirestoreRestRecord = Record<string, unknown> & {
  id: string;
  path: string;
};

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

function projectId() {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!id) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.");
  return id;
}

function documentUrl(collectionName: string, documentName?: string) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents/${collectionName}`;
  return documentName ? `${base}/${documentName}` : base;
}

function valueFromFirestore(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(valueFromFirestore);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields ?? {}).map(([key, nestedValue]) => [key, valueFromFirestore(nestedValue)]),
    );
  }
  return null;
}

function valueToFirestore(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (/^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(parsed.getTime())) {
      return { timestampValue: parsed.toISOString() };
    }
    return { stringValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(valueToFirestore) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, valueToFirestore(nestedValue)]),
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

function parseDocument(document: { name: string; fields?: Record<string, FirestoreValue> }): FirestoreRestRecord {
  const pathParts = document.name.split("/");
  const id = pathParts.at(-1) ?? document.name;
  return {
    id,
    path: document.name,
    ...Object.fromEntries(
      Object.entries(document.fields ?? {}).map(([key, value]) => [key, valueFromFirestore(value)]),
    ),
  };
}

async function firestoreFetch(url: string, idToken: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Firestore request failed with ${response.status}.`);
  }

  return response;
}

export async function listFirestoreDocuments(collectionName: string, idToken: string, pageSize = 250) {
  const response = await firestoreFetch(`${documentUrl(collectionName)}?pageSize=${pageSize}`, idToken);
  const data = (await response.json()) as { documents?: Array<{ name: string; fields?: Record<string, FirestoreValue> }> };
  return (data.documents ?? []).map(parseDocument);
}

export async function getFirestoreDocument(collectionName: string, documentName: string, idToken: string) {
  const response = await firestoreFetch(documentUrl(collectionName, documentName), idToken);
  return parseDocument(await response.json());
}

export async function patchFirestoreDocument(
  collectionName: string,
  documentName: string,
  idToken: string,
  data: Record<string, unknown>,
) {
  const updateMask = Object.keys(data)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  const response = await firestoreFetch(`${documentUrl(collectionName, documentName)}?${updateMask}`, idToken, {
    method: "PATCH",
    body: JSON.stringify({
      fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, valueToFirestore(value)])),
    }),
  });
  return parseDocument(await response.json());
}

export function firestoreError(error: unknown) {
  return jsonError(error instanceof Error ? error.message : "Firestore request failed.", 500);
}
