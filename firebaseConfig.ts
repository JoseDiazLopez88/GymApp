import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDu-zVL2OJmn7Sys8nqpGt-2_CsPnOfQFg",
  authDomain: "calmacoffeeapp.firebaseapp.com",
  projectId: "calmacoffeeapp",
  storageBucket: "calmacoffeeapp.firebasestorage.app",
  messagingSenderId: "241052728524",
  appId: "1:241052728524:web:c35d933555557a35e45669"
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