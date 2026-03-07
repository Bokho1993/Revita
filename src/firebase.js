import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtTTyC_2Env6U5eOVZtZgIki4_8U3leSs",
  authDomain: "su-family-quest.firebaseapp.com",
  projectId: "su-family-quest",
  storageBucket: "su-family-quest.firebasestorage.app",
  messagingSenderId: "973536431895",
  appId: "1:973536431895:web:684ec53060448753a9f152"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function loadProfile(profileId) {
  try {
    const snap = await getDoc(doc(db, "profiles", profileId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Load error:", e);
    return null;
  }
}

export async function saveProfile(profileId, data) {
  try {
    await setDoc(doc(db, "profiles", profileId), data);
    return true;
  } catch (e) {
    console.error("Save error:", e);
    return false;
  }
}

export { db };