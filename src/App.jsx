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
import { auth, db } from "./firebase.js";
import AuthBar from "./AuthBar.jsx";
import JobsPage from "./JobsPage.jsx";
import JobDetailsPage from "./JobDetailsPage.jsx";

const STORAGE_KEY = "job-search-tracker.jobs";

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

function CloudJobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [importFinished, setImportFinished] = useState(false);
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
      console.error("עדכון משרות בענן נכשל", error.code ?? error.message);
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

  async function handleImport() {
    if (importing) return;

    setImporting(true);
    setMessage("");

    const success = await performAction(async () => {
      const localJobs = localData.jobs;
      const ids = localJobs.map((job) => String(job?.id ?? ""));

      if (
        localJobs.length > 400 ||
        ids.some((id) => !id || id.includes("/")) ||
        new Set(ids).size !== ids.length ||
        localJobs.some(
          (job) =>
            !job?.title?.trim() ||
            !job?.company?.trim() ||
            !job?.city?.trim() ||
            !job?.status?.trim(),
        )
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
          // משרה עם אותו מזהה שכבר קיימת בענן נשארת כפי שהיא.
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
      setImportFinished(true);
      setMessage("ההעברה הסתיימה. המשרות המקומיות נשארו גם בדפדפן.");
    }

    setImporting(false);
  }

  if (loading) {
    return <p dir="rtl" role="status">טוענת משרות מהענן...</p>;
  }

  if (loadError) {
    return <p dir="rtl" role="alert">{loadError}</p>;
  }

  return (
    <>
      <section dir="rtl" style={{ padding: "16px" }}>
        <p>המשרות נשמרות בחשבון שלך בענן.</p>

        {localData.error && <p role="alert">{localData.error}</p>}

        {localData.jobs.length > 0 && !importFinished && (
          <>
            <p>
              נמצאו {localData.jobs.length} משרות מקומיות.
              העבירי אותן פעם אחת לחשבון הרצוי.
              משרות בעלות אותו מזהה שכבר קיימות בענן לא יוחלפו.
            </p>

            <button
              type="button"
              disabled={importing}
              onClick={handleImport}
            >
              {importing
                ? "מעבירה משרות..."
                : "העברת המשרות המקומיות לחשבון"}
            </button>
          </>
        )}

        {message && <p role="status">{message}</p>}
        {actionError && <p role="alert">{actionError}</p>}
      </section>

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
        <p dir="rtl" role="alert">{authError}</p>
      ) : !authReady ? (
        <p dir="rtl" role="status">בודקת חשבון...</p>
      ) : user ? (
        <CloudJobs key={user.uid} user={user} />
      ) : (
        <p dir="rtl">
          התחברי עם Google כדי לראות ולנהל את המשרות שלך.
        </p>
      )}
    </BrowserRouter>
  );
}