import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export const getCached = async (key: string) => {
  try {
    const ref = doc(db, "api_cache", key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    const created = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
    const ttl = data.ttl ?? 0;
    if (ttl > 0 && Date.now() > created + ttl * 1000) return null;
    return data.payload ?? null;
  } catch (e) {
    return null;
  }
};

export const setCached = async (key: string, payload: any, ttlSec = 60 * 60) => {
  try {
    await setDoc(doc(db, "api_cache", key), {
      payload,
      ttl: ttlSec,
      createdAt: Timestamp.now(),
    });
  } catch (e) {
    // swallow — caching best-effort
  }
};
