import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, isFirebaseConfigured, withTimeout } from "@/lib/firebase";
import { DiaryEntry, MediaItem } from "@/lib/types";

// ─── LocalStorage key helpers ─────────────────────────────────────────────────
const DEMO_STORAGE_KEY = "daily_flow_local_entries_v1";

function userStorageKey(userId: string) {
  return `daily_flow_entries_${userId}`;
}

// ─── Firestore availability state ─────────────────────────────────────────────
let firestoreAvailable: boolean | null = null;

export function getFirestoreStatus(): boolean | null {
  return firestoreAvailable;
}

// ─── Convert File to Permanent Compressed Base64 Data URL ────────────────────
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!file.type.startsWith("image/") || file.size < 600 * 1024) {
        // Videos or lightweight images kept as-is
        resolve(result);
        return;
      }

      // Compress large images to avoid localStorage size limits
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1400;
        const maxHeight = 1400;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => {
      // Fallback
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}

// ─── Demo initial memories ───────────────────────────────────────────────────
const INITIAL_DEMO_ENTRIES: DiaryEntry[] = [
  {
    id: "demo-entry-1",
    title: "Golden Hour Walk by the Coast & Ocean Thoughts",
    content:
      "The Pacific breeze was crisp this afternoon. Watched the sunlight dissolve into liquid amber against the horizon. Captured a short video of the tide washing over the pebbles — the rhythmic roar of the water has an almost therapeutic grounding effect. Reminded myself to slow down and breathe.",
    entryDate: "2026-11-21",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 7200, nanoseconds: 0 },
    media: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        type: "image",
        path: "demo/ocean-sunset.jpg",
        name: "ocean-sunset.jpg",
      },
      {
        url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
        type: "image",
        path: "demo/coastal-cliffs.jpg",
        name: "coastal-cliffs.jpg",
      },
    ],
    userId: "demo-user-flow-2026",
    mood: "peaceful",
  },
  {
    id: "demo-entry-2",
    title: "Rainy Studio Morning: Architecture & Matcha",
    content:
      "Poured warm oat milk over ceremonial grade matcha while raindrops beaded against the studio glass. Spent three uninterrupted hours drafting the new fluid component system. Sometimes the quietest rainy mornings bring the sharpest mental clarity.",
    entryDate: "2026-11-19",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800, nanoseconds: 0 },
    media: [
      {
        url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80",
        type: "image",
        path: "demo/matcha-desk.jpg",
        name: "matcha-desk.jpg",
      },
    ],
    userId: "demo-user-flow-2026",
    mood: "focused",
  },
  {
    id: "demo-entry-3",
    title: "Weekend Highland Trail Hike with Friends",
    content:
      "Climbed the ridge line before the fog settled in. The panorama across the valley was breathtaking. We sat on the granite crest, shared clementines and hot tea from a thermos, and laughed about old college stories.",
    entryDate: "2026-11-14",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 604800, nanoseconds: 0 },
    media: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        type: "image",
        path: "demo/mountain-ridge.jpg",
        name: "mountain-ridge.jpg",
      },
    ],
    userId: "demo-user-flow-2026",
    mood: "adventurous",
  },
  {
    id: "demo-entry-4",
    title: "Autumn Foliage & Coffee by the Lake",
    content:
      "The maple leaves turned deep crimson and amber gold this week. Walked around the lake with a hot cinnamon latte. Recorded reflections on building intuitive tools for personal memory keeping.",
    entryDate: "2026-10-28",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 2073600, nanoseconds: 0 },
    media: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        type: "image",
        path: "demo/autumn-lake.jpg",
        name: "autumn-lake.jpg",
      },
    ],
    userId: "demo-user-flow-2026",
    mood: "reflective",
  },
  {
    id: "demo-entry-5",
    title: "Designing the Liquid Glass Design System",
    content:
      "Explored Apple's visionOS and macOS crystal refraction styling. Dialed in the exact specular highlights, translucent blur radiuses, and chromatic aurora backdrops. Loving how tactile it feels.",
    entryDate: "2026-10-15",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3196800, nanoseconds: 0 },
    media: [],
    userId: "demo-user-flow-2026",
    mood: "creative",
  },
  {
    id: "demo-entry-6",
    title: "First Sketches for Daily Flow",
    content:
      "Started ideating a diary that combines daily thoughts with rich photos, videos, and private user isolation. The core premise: pure privacy and serene visual calm.",
    entryDate: "2026-09-24",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 5011200, nanoseconds: 0 },
    media: [
      {
        url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
        type: "image",
        path: "demo/initial-sketches.jpg",
        name: "initial-sketches.jpg",
      },
    ],
    userId: "demo-user-flow-2026",
    mood: "inspired",
  },
];

// ─── LocalStorage helpers ──────────────────────────────────────────────────────
function getLocalEntries(userId: string): DiaryEntry[] {
  if (typeof window === "undefined") return [];
  const key = userId === "demo-user-flow-2026" ? DEMO_STORAGE_KEY : userStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId === "demo-user-flow-2026") {
        localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_ENTRIES));
        return INITIAL_DEMO_ENTRIES;
      }
      return [];
    }
    const parsed = JSON.parse(raw) as DiaryEntry[];
    return parsed;
  } catch {
    return [];
  }
}

function saveLocalEntries(userId: string, entries: DiaryEntry[]) {
  if (typeof window === "undefined") return;
  const key = userId === "demo-user-flow-2026" ? DEMO_STORAGE_KEY : userStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch (err) {
    console.warn("Storage quota warning:", err);
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Fetch all diary entries.
 * Tries Firestore. If Firestore isn't ready or times out, gracefully falls back
 * to local entries without any jarring error banners.
 */
export async function fetchUserEntries(userId: string, isDemo = false): Promise<DiaryEntry[]> {
  if (isDemo) {
    const entries = getLocalEntries(userId);
    return entries.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }

  // If already flagged unavailable in this session, use local vault immediately
  if (firestoreAvailable === false || !db || !isFirebaseConfigured) {
    const entries = getLocalEntries(userId);
    return entries.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }

  try {
    const entriesRef = collection(db, "users", userId, "entries");
    const q = query(entriesRef, orderBy("entryDate", "desc"));
    const snapshot = await withTimeout(getDocs(q), 4500, "Loading diary entries");

    firestoreAvailable = true;

    const list: DiaryEntry[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as DiaryEntry);
    });

    if (list.length > 0) {
      saveLocalEntries(userId, list);
      return list;
    }

    // If Firestore is empty, check if we have local entries to return
    const local = getLocalEntries(userId);
    return local.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  } catch (error: any) {
    // Firestore not yet initialized in console or network timeout — seamlessly use local vault
    console.info("Using local crystal storage vault:", error?.message || error);
    firestoreAvailable = false;
    const entries = getLocalEntries(userId);
    return entries.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }
}

/**
 * Upload a media file.
 * Converts to permanent base64 data URL so it never expires,
 * and additionally uploads to Firebase Storage when cloud is active.
 */
export async function uploadMediaFile(
  userId: string,
  entryId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<MediaItem> {
  const isVideo = file.type.startsWith("video/");
  const type = isVideo ? "video" : "image";
  const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storagePath = `users/${userId}/${entryId}/${cleanName}`;

  // Always generate permanent Base64 Data URL first
  const permanentDataUrl = await fileToDataUrl(file);

  // If Storage is not configured or Firestore was unavailable, return permanent Base64
  if (!storage || !isFirebaseConfigured || firestoreAvailable === false) {
    if (onProgress) onProgress(100);
    return {
      url: permanentDataUrl,
      type,
      path: storagePath,
      name: file.name,
      size: file.size,
    };
  }

  // Try Firebase Storage upload
  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise((resolve) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          // If storage fails, fall back smoothly to permanent Base64
          console.warn("Storage upload fallback to base64:", error);
          resolve({
            url: permanentDataUrl,
            type,
            path: storagePath,
            name: file.name,
            size: file.size,
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              type,
              path: storagePath,
              name: file.name,
              size: file.size,
            });
          } catch {
            resolve({
              url: permanentDataUrl,
              type,
              path: storagePath,
              name: file.name,
              size: file.size,
            });
          }
        }
      );
    });
  } catch (e) {
    return {
      url: permanentDataUrl,
      type,
      path: storagePath,
      name: file.name,
      size: file.size,
    };
  }
}

/**
 * Create a new diary entry.
 * Saves to Firestore when available, and always saves to local crystal storage.
 */
export async function createDiaryEntry(
  userId: string,
  entry: Omit<DiaryEntry, "id">,
  isDemo = false
): Promise<DiaryEntry> {
  const localId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newLocalEntry: DiaryEntry = {
    ...entry,
    id: localId,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    userId,
  };

  // Always save locally immediately
  const current = getLocalEntries(userId);
  saveLocalEntries(userId, [newLocalEntry, ...current]);

  if (isDemo || !db || !isFirebaseConfigured || firestoreAvailable === false) {
    return newLocalEntry;
  }

  // Try syncing to Firestore in the background
  try {
    const entriesRef = collection(db, "users", userId, "entries");
    const docData = {
      title: entry.title,
      content: entry.content,
      entryDate: entry.entryDate,
      createdAt: serverTimestamp(),
      media: entry.media || [],
      userId,
      ...(entry.mood ? { mood: entry.mood } : {}),
    };

    const docRef = await withTimeout(addDoc(entriesRef, docData), 5000, "Saving to Firestore");
    firestoreAvailable = true;

    const saved: DiaryEntry = { id: docRef.id, ...docData };
    // Update local cache with doc id
    const updated = current.map((item) => (item.id === localId ? saved : item));
    saveLocalEntries(userId, updated);
    return saved;
  } catch (error: any) {
    console.info("Saved to local crystal vault:", error?.message || error);
    firestoreAvailable = false;
    return newLocalEntry;
  }
}

/**
 * Update an existing diary entry.
 */
export async function updateDiaryEntry(
  userId: string,
  entryId: string,
  updates: Partial<DiaryEntry>,
  isDemo = false
): Promise<void> {
  const current = getLocalEntries(userId);
  const updated = current.map((item) =>
    item.id === entryId
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item
  );
  saveLocalEntries(userId, updated);

  if (isDemo || !db || !isFirebaseConfigured || firestoreAvailable === false) return;

  try {
    const entryRef = doc(db, "users", userId, "entries", entryId);
    const payload: any = { ...updates, updatedAt: serverTimestamp() };
    delete payload.id;
    await withTimeout(updateDoc(entryRef, payload), 5000, "Updating Firestore");
  } catch (error: any) {
    console.warn("Firestore update notice:", error?.message || error);
  }
}

/**
 * Delete a diary entry.
 */
export async function deleteDiaryEntry(
  userId: string,
  entryId: string,
  mediaList: MediaItem[],
  isDemo = false
): Promise<void> {
  const current = getLocalEntries(userId);
  saveLocalEntries(userId, current.filter((item) => item.id !== entryId));

  if (isDemo) return;

  if (storage && isFirebaseConfigured && firestoreAvailable !== false && mediaList?.length > 0) {
    const activeStorage = storage;
    await Promise.allSettled(
      mediaList
        .filter((m) => m.path && !m.path.startsWith("demo/"))
        .map((m) =>
          deleteObject(ref(activeStorage, m.path)).catch((err) =>
            console.warn("Storage cleanup note:", err)
          )
        )
    );
  }

  if (!db || !isFirebaseConfigured || firestoreAvailable === false) return;

  try {
    await withTimeout(
      deleteDoc(doc(db, "users", userId, "entries", entryId)),
      5000,
      "Deleting Firestore entry"
    );
  } catch (error: any) {
    console.warn("Firestore delete notice:", error?.message || error);
  }
}
