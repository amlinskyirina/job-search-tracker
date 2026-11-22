import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import styled from "styled-components";
import { auth, googleProvider } from "./firebase.js";

const Bar = styled.section`
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 20px;
  padding: 14px 18px;
  border: 1px solid #cbdcf0;
  border-radius: 14px;
  background: #f8fbff;
  text-align: start;
  color: #0f2044;

  @media (max-width: 480px) {
    margin: 12px;
    padding: 12px;
  }
`;

const Account = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Avatar = styled.span`
  display: grid;
  flex: 0 0 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: #dff3f1;
  color: #087f83;
  font-size: 20px;
  font-weight: 700;
`;

const AccountText = styled.div`
  min-width: 0;
  overflow-wrap: anywhere;

  strong {
    display: block;
    font-size: 16px;
  }

  p {
    margin: 3px 0 0;
    color: #52657a;
    font-size: 14px;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 8px 18px;
  border: 1px solid #087f83;
  border-radius: 10px;
  background: #087f83;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #066b70;
  }

  &[data-variant="secondary"] {
    background: #fff;
    color: #087f83;
  }

  &[data-variant="secondary"]:hover:not(:disabled) {
    background: #e7f6f4;
  }

  &:focus-visible {
    outline: 3px solid #80b4ff;
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

const ErrorText = styled.p`
  width: 100%;
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
`;

export default function AuthBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      () => {
        setErrorMessage("בדיקת החשבון נכשלה. נסי לרענן את הדף.");
        setLoading(false);
      },
    );
  }, []);

  async function handleLogin() {
    if (busy) return;

    setBusy(true);
    setErrorMessage("");

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage("ההתחברות נכשלה. נסי שוב.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (busy) return;

    setBusy(true);
    setErrorMessage("");

    try {
      await signOut(auth);
    } catch {
      setErrorMessage("ההתנתקות נכשלה. נסי שוב.");
    } finally {
      setBusy(false);
    }
  }

  const displayName = user?.displayName || user?.email || "החשבון שלי";
  const initial = Array.from(displayName.trim())[0] || "●";

  return (
    <Bar dir="rtl" aria-label="חשבון משתמש" aria-busy={busy}>
      {loading ? (
        <p role="status">בודקת חשבון...</p>
      ) : user ? (
        <>
          <Account>
            <Avatar aria-hidden="true">{initial}</Avatar>

            <AccountText>
              <strong>
                <bdi>{displayName}</bdi>
              </strong>
              <p>מחוברת לחשבון שלך</p>
            </AccountText>
          </Account>

          <Button
            type="button"
            data-variant="secondary"
            disabled={busy}
            onClick={handleLogout}
          >
            {busy ? "מתנתקת..." : "התנתקות"}
          </Button>
        </>
      ) : (
        <>
          <AccountText>
            <strong>המשרות שלך, בכל מכשיר</strong>
            <p>התחברי כדי לראות ולנהל את המשרות שלך.</p>
          </AccountText>

          <Button
            type="button"
            disabled={busy}
            onClick={handleLogin}
          >
            {busy ? "מתחברת..." : "התחברות עם Google"}
          </Button>
        </>
      )}

      {errorMessage && <ErrorText role="alert">{errorMessage}</ErrorText>}
    </Bar>
  );
}