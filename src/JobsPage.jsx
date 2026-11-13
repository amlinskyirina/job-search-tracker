import { useState } from "react";
import JobList from "./JobList.jsx";
import JobForm from "./JobForm.jsx";
import { statuses } from "./jobStatuses.js";

export default function JobsPage({ jobs, onAddJob }) {
  const [selectedStatus, setSelectedStatus] = useState("");

  const filterStatuses = [
    ...new Set([...statuses, ...jobs.map((job) => job.status).filter(Boolean)]),
  ];

  const visibleJobs =
    selectedStatus === ""
      ? jobs
      : jobs.filter((job) => job.status === selectedStatus);

  return (
    <main dir="rtl">
      <header>
        <h1>הצעד הבא</h1>
        <p>ניהול חיפוש העבודה שלי</p>
      </header>

      <label>
        סינון לפי סטטוס{" "}
        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="">כל הסטטוסים</option>

          {filterStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      {selectedStatus !== "" && visibleJobs.length === 0 ? (
        <p role="status">אין משרות בסטטוס שנבחר</p>
      ) : (
        <JobList jobs={visibleJobs} />
      )}

      <JobForm onAddJob={onAddJob} />
    </main>
  );
}