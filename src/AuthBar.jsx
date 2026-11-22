import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase.js";

export default function AuthBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (authError) => {
        console.error("בדיקת התחברות נכשלה", authError.code);
        setError("לא ניתן לבדוק את מצב ההתחברות. נסי לרענן.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  async function handleLogin() {
    setError("");
    setBusy(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (authError) {
      console.error("ההתחברות נכשלה", authError.code);

      if (authError.code !== "auth/popup-closed-by-user") {
        setError("ההתחברות נכשלה. נסי שוב ואפשרי חלונות קופצים.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setError("");
    setBusy(true);

    try {
      await signOut(auth);
    } catch (authError) {
      console.error("ההתנתקות נכשלה", authError.code);
      setError("ההתנתקות נכשלה. נסי שוב.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      dir="rtl"
      aria-label="חשבון משתמש"
      style={{ padding: "16px", textAlign: "right" }}
    >
      {loading ? (
        <p role="status">בודקת התחברות...</p>
      ) : user ? (
        <div>
          <p>מחוברת בתור {user.displayName || user.email}</p>
          <button type="button" onClick={handleLogout} disabled={busy}>
            התנתקות
          </button>
        </div>
      ) : (
        <button type="button" onClick={handleLogin} disabled={busy}>
          {busy ? "מתחברת..." : "התחברות עם Google"}
        </button>
      )}

      {error && <p role="alert">{error}</p>}
    </section>
  );
}