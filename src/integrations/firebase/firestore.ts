import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface IceCreamVan {
  id?: string;
  name: string;
  phone: string;
  status: "active" | "inactive" | "maintenance";
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface VanSchedule {
  id?: string;
  vanId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserRole {
  id?: string;
  userId: string;
  role: "owner" | "admin" | "user";
  createdAt?: Timestamp;
}

// ICE CREAM VANS CRUD
export const createVan = async (van: IceCreamVan) => {
  const docRef = await addDoc(collection(db, "ice_cream_vans"), {
    ...van,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getVans = async (): Promise<IceCreamVan[]> => {
  const querySnapshot = await getDocs(collection(db, "ice_cream_vans"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as IceCreamVan));
};

export const getVan = async (vanId: string): Promise<IceCreamVan | null> => {
  const docSnap = await getDoc(doc(db, "ice_cream_vans", vanId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as IceCreamVan;
  }
  return null;
};

export const updateVan = async (vanId: string, updates: Partial<IceCreamVan>) => {
  await updateDoc(doc(db, "ice_cream_vans", vanId), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteVan = async (vanId: string) => {
  await deleteDoc(doc(db, "ice_cream_vans", vanId));
};

// VAN SCHEDULES CRUD
export const createSchedule = async (schedule: VanSchedule) => {
  const docRef = await addDoc(collection(db, "van_schedules"), {
    ...schedule,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getSchedules = async (vanId?: string): Promise<VanSchedule[]> => {
  const q = vanId
    ? query(collection(db, "van_schedules"), where("vanId", "==", vanId))
    : query(collection(db, "van_schedules"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as VanSchedule));
};

export const updateSchedule = async (scheduleId: string, updates: Partial<VanSchedule>) => {
  await updateDoc(doc(db, "van_schedules", scheduleId), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteSchedule = async (scheduleId: string) => {
  await deleteDoc(doc(db, "van_schedules", scheduleId));
};

// VAN LOCATIONS (real-time updates)
export const updateVanLocation = async (
  vanId: string,
  lat: number,
  lng: number
) => {
  await updateVan(vanId, {
    currentLocation: { lat, lng },
  });
};

// USER ROLES
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  const q = query(collection(db, "user_roles"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as UserRole));
};

export const createUserRole = async (userId: string, role: "owner" | "admin" | "user") => {
  const docRef = await addDoc(collection(db, "user_roles"), {
    userId,
    role,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};
