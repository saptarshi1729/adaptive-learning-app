// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";

// Firebase Configuration loaded securely from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const COLLECTION_SESSIONS = "daily_sessions";
const COLLECTION_HISTORY = "learning_history";
const COLLECTION_SETTINGS = "user_settings";

/**
 * Save or update daily session state (briefing cards read status, quiz submissions, synthesis)
 */
export async function saveDailySessionToFirestore(session) {
  if (!session || !session.date) return;
  const docId = `session-${session.date}`;
  
  // Also backup to localStorage for instant local recovery
  try {
    localStorage.setItem(`adaptive_session_${session.date}`, JSON.stringify(session));
  } catch (e) {
    console.warn("Local storage cache warning:", e);
  }

  try {
    const sessionRef = doc(db, COLLECTION_SESSIONS, docId);
    await setDoc(sessionRef, {
      ...session,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Firestore write fallback to local storage:", err.message);
    return false;
  }
}

/**
 * Fetch daily session for a given date (e.g., "2026-10-21")
 */
export async function fetchDailySessionFromFirestore(dateString) {
  const docId = `session-${dateString}`;
  try {
    const sessionRef = doc(db, COLLECTION_SESSIONS, docId);
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Firestore read fallback to local storage:", err.message);
  }

  // Fallback to local storage if offline or not in Firestore yet
  try {
    const local = localStorage.getItem(`adaptive_session_${dateString}`);
    if (local) return JSON.parse(local);
  } catch (e) {
    console.error("Local storage read error:", e);
  }
  return null;
}

/**
 * Purge any future or pre-written sessions from Firestore and localStorage.
 * Ensures no content is kept ahead of time into future days.
 */
export async function cleanupFutureSessions(todayDateString) {
  // 1. Clean localStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("adaptive_session_")) {
        const sessionDate = key.replace("adaptive_session_", "");
        if (sessionDate > todayDateString) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn("LocalStorage cleanup error:", e);
  }

  // 2. Clean Firestore daily_sessions collection
  try {
    const sessionsCol = collection(db, COLLECTION_SESSIONS);
    const snap = await getDocs(sessionsCol);
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const sDate = data.date || docSnap.id.replace("session-", "");
      if (sDate > todayDateString) {
        await deleteDoc(docSnap.ref);
        console.log(`[Firestore Cleanup] Deleted future session: ${docSnap.id}`);
      }
    }
  } catch (err) {
    console.warn("Firestore future session cleanup warning:", err.message);
  }
}

/**
 * Delete a specific daily session (used when user chooses to regenerate today's feed)
 */
export async function deleteDailySession(dateString) {
  try {
    localStorage.removeItem(`adaptive_session_${dateString}`);
    const sessionRef = doc(db, COLLECTION_SESSIONS, `session-${dateString}`);
    await deleteDoc(sessionRef);
    return true;
  } catch (err) {
    console.warn("Failed to delete daily session:", err);
    return false;
  }
}

/**
 * Record a completed session to history and update topic mastery
 */
export async function recordCompletedSession(session) {
  if (!session || !session.date) return;
  const docId = `hist-${session.date}`;
  
  const historyRecord = {
    date: session.date,
    theme: session.theme,
    topicsCovered: session.cards ? session.cards.map(c => c.topicId || c.title) : [],
    totalQuestions: session.quiz ? session.quiz.length : 0,
    correctAnswers: session.quiz ? session.quiz.filter(q => q.isCorrect).length : 0,
    completedAt: new Date().toISOString(),
    synthesis: session.synthesis || ""
  };

  try {
    const histRef = doc(db, COLLECTION_HISTORY, docId);
    await setDoc(histRef, historyRecord, { merge: true });
  } catch (err) {
    console.warn("Firestore history record fallback:", err.message);
  }

  // Save in local storage history array
  try {
    const localHist = JSON.parse(localStorage.getItem("adaptive_learning_history") || "[]");
    const existingIdx = localHist.findIndex(h => h.date === session.date);
    if (existingIdx >= 0) {
      localHist[existingIdx] = historyRecord;
    } else {
      localHist.push(historyRecord);
    }
    localStorage.setItem("adaptive_learning_history", JSON.stringify(localHist));
  } catch (e) {
    console.warn("Local history storage failed:", e);
  }
}

/**
 * Get all completed learning history sessions from Firestore
 */
export async function fetchLearningHistory() {
  let records = [];
  try {
    const q = query(collection(db, COLLECTION_HISTORY), orderBy("date", "desc"), limit(30));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(docSnap => {
      records.push(docSnap.data());
    });
  } catch (err) {
    console.warn("Firestore history query fallback to local cache:", err.message);
  }

  if (records.length === 0) {
    try {
      const local = localStorage.getItem("adaptive_learning_history");
      if (local) records = JSON.parse(local);
    } catch (e) {
      console.warn("Failed to read local history:", e);
    }
  }

  // Filter out any previous mock seed records from local development cache
  records = records.filter(r => r.date !== "2026-10-19" && r.date !== "2026-10-20");
  try {
    localStorage.setItem("adaptive_learning_history", JSON.stringify(records));
  } catch (_) {}

  return records;
}

/**
 * Save customized steering focus draft
 */
export async function saveFocusDraft(draft) {
  try {
    localStorage.setItem("adaptive_focus_draft", JSON.stringify(draft));
  } catch (_) {}

  try {
    const draftRef = doc(db, COLLECTION_SETTINGS, "focus_draft");
    await setDoc(draftRef, {
      ...draft,
      savedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore draft save fallback to local:", err.message);
  }
}

/**
 * Load customized steering focus draft
 */
export async function loadFocusDraft() {
  try {
    const draftRef = doc(db, COLLECTION_SETTINGS, "focus_draft");
    const snap = await getDoc(draftRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (_) {}

  try {
    const local = localStorage.getItem("adaptive_focus_draft");
    if (local) return JSON.parse(local);
  } catch (_) {}

  return {
    categories: [
      "Modern AI & Frontier Models",
      "Distributed Systems & Modern Data Engines",
      "Emerging Web & Cloud Frameworks"
    ],
    prompt: ""
  };
}
