import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import JobsPage from "./JobsPage.jsx";
import JobDetailsPage from "./JobDetailsPage.jsx";
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

  function saveJobs(updatedJobs) {
    setJobs(updatedJobs);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
      setStorageError("");
    } catch (error) {
      console.error("שמירת המשרות נכשלה", error);
      setStorageError(
        "לא ניתן לשמור את המשרות בדפדפן. ייתכן ששינויים יאבדו ברענון.",
      );
    }
  }

  function handleAddJob(jobDetails) {
    const newJob = { ...jobDetails, id: crypto.randomUUID() };
    saveJobs([newJob, ...jobs]);
  }

  function handleEditJob(jobId, updatedFields) {
    const updatedJobs = jobs.map((job) =>
      job.id === jobId
        ? { ...job, ...updatedFields, id: job.id }
        : job,
    );

    saveJobs(updatedJobs);
  }

  return (
    <BrowserRouter>
      {storageError && <p role="alert" dir="rtl">{storageError}</p>}

      <Routes>
        <Route
          path="/"
          element={<JobsPage jobs={jobs} onAddJob={handleAddJob} />}
        />
        <Route
          path="/jobs/:jobId"
          element={<JobDetailsPage jobs={jobs} onEditJob={handleEditJob} />}
        />
      </Routes>
    </BrowserRouter>
  );
}