import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper: Save user profile to Firestore
export const saveUserToFirestore = async (uid: string, data: {
  email: string;
  displayName?: string;
  photoURL?: string;
  gender?: string;
  age?: string;
  weight?: string;
  height?: string;
  goal?: string;
  activityLevel?: string;
}) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, {
        ...data,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};

// Helper: Get all users (for chat)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users: any[] = [];
    snapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Helper: Generate chat ID for private conversations
export const getPrivateChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};