import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import styled from "styled-components";

import { auth, db } from "./firebase.js";
import AuthBar from "./AuthBar.jsx";
import JobsPage from "./JobsPage.jsx";
import JobDetailsPage from "./JobDetailsPage.jsx";

const STORAGE_KEY = "job-search-tracker.jobs";

const CloudSection = styled.section`
  margin: 12px 20px;
  text-align: start;

  @media (max-width: 480px) {
    margin: 12px;
  }
`;

const CloudNote = styled.p`
  margin: 0;
  color: #52657a;
  font-size: 14px;
  line-height: 1.6;
`;

const ImportPanel = styled.div`
  margin-top: 12px;
  padding: 16px;
  border: 1px solid #b9e1db;
  border-radius: 12px;
  background: #effaf7;
  color: #0f2044;

  h2 {
    margin: 0 0 6px;
    font-size: 17px;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  }
`;

const ImportActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;

  button {
    min-height: 44px;
    padding: 8px 16px;
    border: 1px solid #087f83;
    border-radius: 10px;
    background: #087f83;
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  button[data-variant="secondary"] {
    background: #fff;
    color: #087f83;
  }

  button:hover:not(:disabled) {
    filter: brightness(0.95);
  }

  button:focus-visible {
    outline: 3px solid #80b4ff;
    outline-offset: 3px;
  }

  button:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  @media (max-width: 480px) {
    button {
      width: 100%;
    }
  }
`;

const StatusMessage = styled.p`
  margin: 12px 0 0;
  color: #065f46;
  font-size: 14px;
  line-height: 1.6;
`;

const ErrorMessage = styled.p`
  margin: 12px 0 0;
  color: #b91c1c;
  font-size: 14px;
  line-height: 1.6;
`;

const PageMessage = styled.p`
  margin: 20px;
  padding: 16px;
  border: 1px solid #cbdcf0;
  border-radius: 12px;
  background: #f8fbff;
  color: #0f2044;
  text-align: start;
  line-height: 1.6;
`;

function readLocalJobs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved === null ? [] : JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid jobs data");
    }

    return { jobs: parsed, error: "" };
  } catch {
    return {
      jobs: [],
      error: "לא ניתן לקרוא את המשרות המקומיות. הנתונים לא שונו.",
    };
  }
}

function importStorageKey(userId) {
  return `job-search-tracker.import-finished.${userId}`;
}

function wasImportFinished(userId) {
  try {
    return localStorage.getItem(importStorageKey(userId)) === "true";
  } catch {
    return false;
  }
}

function jobFields(job) {
  return {
    title: String(job.title ?? ""),
    company: String(job.company ?? ""),
    city: String(job.city ?? ""),
    status: String(job.status ?? ""),
    url: String(job.url ?? ""),
    notes: String(job.notes ?? ""),
  };
}

function dateValue(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function sortJobs(jobs) {
  return [...jobs].sort((first, second) => {
    const firstDate = dateValue(first.createdAt);
    const secondDate = dateValue(second.createdAt);

    if (firstDate === null && secondDate === null) return 0;
    if (firstDate === null) return 1;
    if (secondDate === null) return -1;

    return secondDate - firstDate;
  });
}

function isValidLocalJob(job) {
  return (
    job !== null &&
    typeof job === "object" &&
    ["title", "company", "city", "status"].every(
      (field) =>
        typeof job[field] === "string" &&
        job[field].trim().length > 0,
    )
  );
}

function CloudJobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [importFinished, setImportFinished] = useState(() =>
    wasImportFinished(user.uid),
  );
  const [localData] = useState(readLocalJobs);

  useEffect(() => {
    const jobsCollection = collection(db, "users", user.uid, "jobs");

    return onSnapshot(
      jobsCollection,
      (snapshot) => {
        const cloudJobs = snapshot.docs.map((jobDoc) => ({
          ...jobDoc.data(),
          id: jobDoc.id,
        }));

        setJobs(sortJobs(cloudJobs));
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("טעינת משרות מהענן נכשלה", error.code);
        setLoadError(
          "טעינת המשרות נכשלה. בדקי חיבור לאינטרנט והרשאות Firestore.",
        );
        setLoading(false);
      },
    );
  }, [user.uid]);

  function jobReference(jobId) {
    return doc(db, "users", user.uid, "jobs", String(jobId));
  }

  async function performAction(action) {
    setActionError("");

    try {
      if (auth.currentUser?.uid !== user.uid) {
        throw new Error("החשבון השתנה. התחברי מחדש.");
      }

      await action();
      return true;
    } catch (error) {
      console.error(
        "עדכון משרות בענן נכשל",
        error.code ?? error.message,
      );

      setActionError(
        "הפעולה לא הושלמה בענן. בדקי את החיבור ונסי שוב.",
      );

      return false;
    }
  }

  function handleAddJob(details) {
    return performAction(async () => {
      const jobId = crypto.randomUUID();

      await setDoc(jobReference(jobId), {
        ...jobFields(details),
        createdAt: new Date().toISOString(),
        isFavorite: false,
      });
    });
  }

  function handleEditJob(jobId, updatedFields) {
    return performAction(() =>
      updateDoc(jobReference(jobId), jobFields(updatedFields)),
    );
  }

  function handleDeleteJob(jobId) {
    return performAction(() => deleteDoc(jobReference(jobId)));
  }

  function handleToggleFavorite(jobId) {
    return performAction(() =>
      runTransaction(db, async (transaction) => {
        const reference = jobReference(jobId);
        const snapshot = await transaction.get(reference);

        if (!snapshot.exists()) {
          throw new Error("המשרה כבר אינה קיימת.");
        }

        transaction.update(reference, {
          isFavorite: snapshot.data().isFavorite !== true,
        });
      }),
    );
  }

  function rememberImportFinished(successMessage) {
    setImportFinished(true);

    try {
      localStorage.setItem(importStorageKey(user.uid), "true");
      setMessage(successMessage);
    } catch {
      setMessage(
        `${successMessage} לא ניתן לזכור את ההסתרה בדפדפן הזה, ולכן ההודעה עשויה לחזור ברענון.`,
      );
    }
  }

  async function handleImport() {
    if (importing || importFinished) return;

    setImporting(true);
    setMessage("");

    const success = await performAction(async () => {
      const localJobs = localData.jobs;
      const ids = localJobs.map((job) => String(job?.id ?? ""));

      if (
        localJobs.length > 400 ||
        ids.some((id) => !id || id.includes("/")) ||
        new Set(ids).size !== ids.length ||
        !localJobs.every(isValidLocalJob)
      ) {
        throw new Error("יש לבדוק את נתוני הייבוא לפני ההעברה.");
      }

      await runTransaction(db, async (transaction) => {
        const references = ids.map(jobReference);
        const snapshots = [];

        // קוראים את כל המשרות לפני שמתחילים לכתוב.
        for (const reference of references) {
          snapshots.push(await transaction.get(reference));
        }

        localJobs.forEach((job, index) => {
          // משרה עם אותו מזהה שכבר קיימת בענן לא תוחלף.
          if (snapshots[index].exists()) return;

          transaction.set(references[index], {
            ...jobFields(job),
            createdAt:
              dateValue(job.createdAt) === null ? null : job.createdAt,
            isFavorite: job.isFavorite === true,
          });
        });
      });
    });

    if (success) {
      rememberImportFinished(
        "המשרות הועברו לחשבון. העותק המקומי נשמר בדפדפן.",
      );
    }

    setImporting(false);
  }

  if (loading) {
    return (
      <PageMessage dir="rtl" role="status">
        טוענת משרות מהענן...
      </PageMessage>
    );
  }

  if (loadError) {
    return (
      <PageMessage dir="rtl" role="alert">
        {loadError}
      </PageMessage>
    );
  }

  return (
    <>
      <CloudSection dir="rtl">
        <CloudNote>
          המשרות נשמרות בחשבון שלך בענן.
        </CloudNote>

        {localData.error && (
          <ErrorMessage role="alert">
            {localData.error}
          </ErrorMessage>
        )}

        {localData.jobs.length > 0 && !importFinished && (
          <ImportPanel>
            <h2>משרות ששמרת בדפדפן</h2>

            <p>
              נמצאו {localData.jobs.length} משרות מקומיות.
              אם עדיין לא העברת אותן לחשבון הזה, אפשר להעביר עכשיו.
              משרות בעלות אותו מזהה שכבר קיימות בחשבון לא יוחלפו.
            </p>

            <ImportActions>
              <button
                type="button"
                disabled={importing}
                onClick={handleImport}
              >
                {importing ? "מעבירה משרות..." : "העברה לחשבון"}
              </button>

              <button
                type="button"
                data-variant="secondary"
                disabled={importing}
                onClick={() =>
                  rememberImportFinished(
                    "הודעת ההעברה הוסתרה. המשרות לא שונו.",
                  )
                }
              >
                כבר העברתי, הסתרת ההודעה
              </button>
            </ImportActions>
          </ImportPanel>
        )}

        {message && (
          <StatusMessage role="status">
            {message}
          </StatusMessage>
        )}

        {actionError && (
          <ErrorMessage role="alert">
            {actionError}
          </ErrorMessage>
        )}
      </CloudSection>

      <Routes>
        <Route
          path="/"
          element={
            <JobsPage
              jobs={jobs}
              onAddJob={handleAddJob}
              onToggleFavorite={handleToggleFavorite}
              onDeleteJob={handleDeleteJob}
            />
          }
        />

        <Route
          path="/jobs/:jobId"
          element={
            <JobDetailsPage
              jobs={jobs}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
            />
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
        setAuthError("");
      },
      (error) => {
        console.error("בדיקת החשבון נכשלה", error.code);
        setAuthError("בדיקת החשבון נכשלה. נסי לרענן את הדף.");
        setAuthReady(true);
      },
    );
  }, []);

  return (
    <BrowserRouter>
      <AuthBar />

      {authError ? (
        <PageMessage dir="rtl" role="alert">
          {authError}
        </PageMessage>
      ) : !authReady ? (
        <PageMessage dir="rtl" role="status">
          בודקת חשבון...
        </PageMessage>
      ) : user ? (
        <CloudJobs key={user.uid} user={user} />
      ) : (
        <PageMessage dir="rtl">
          התחברי עם Google כדי לראות ולנהל את המשרות שלך.
        </PageMessage>
      )}
    </BrowserRouter>
  );
}