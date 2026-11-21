import { Timestamp, FieldValue } from "firebase/firestore";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  path: string; // Storage path, e.g. users/{uid}/{entryId}/{fileName}
  name: string;
  size?: number;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  entryDate: string; // YYYY-MM-DD
  createdAt?: Timestamp | FieldValue | { seconds: number; nanoseconds: number } | null | string;
  updatedAt?: Timestamp | FieldValue | { seconds: number; nanoseconds: number } | null | string;
  media: MediaItem[];
  userId?: string;
  mood?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemoUser?: boolean;
}
