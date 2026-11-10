import { useEffect, useState } from "react";
import JobsPage from "./JobsPage.jsx";
import { sampleJobs } from "./sampleJobs.js";

const STORAGE_KEY = "job-search-tracker.jobs";

function loadJobs() {
  try {
    const savedJobs = localStorage.getItem(STORAGE_KEY);

    if (savedJobs === null) {
      return sampleJobs;
    }

    const parsedJobs = JSON.parse(savedJobs);
    return Array.isArray(parsedJobs) ? parsedJobs : sampleJobs;
  } catch (error) {
    console.error("טעינת המשרות נכשלה", error);
    return sampleJobs;
  }
}

export default function App() {
  const [jobs, setJobs] = useState(loadJobs);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      setStorageError("");
    } catch (error) {
      console.error("שמירת המשרות נכשלה", error);
      setStorageError("לא ניתן לשמור את המשרות בדפדפן. ייתכן ששינויים יאבדו ברענון.");
    }
  }, [jobs]);

  function handleAddJob(jobDetails) {
    const newJob = {
      ...jobDetails,
      id: crypto.randomUUID(),
    };

    setJobs((currentJobs) => [newJob, ...currentJobs]);
  }

  return (
    <>
      {storageError && <p role="alert" dir="rtl">{storageError}</p>}
      <JobsPage jobs={jobs} onAddJob={handleAddJob} />
    </>
  );
}