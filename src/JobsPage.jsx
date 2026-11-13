import { useState } from "react";
import JobList from "./JobList.jsx";
import JobForm from "./JobForm.jsx";
import { statuses } from "./jobStatuses.js";

export default function JobsPage({ jobs, onAddJob }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const filterStatuses = [
    ...new Set([...statuses, ...jobs.map((job) => job.status).filter(Boolean)]),
  ];

  const query = searchText.trim().toLowerCase();

  const visibleJobs = jobs.filter((job) => {
    const matchesStatus = selectedStatus === "" || job.status === selectedStatus;
    const matchesSearch =
      query === "" ||
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const showNoMatches =
    visibleJobs.length === 0 && (query !== "" || selectedStatus !== "");

  return (
    <main dir="rtl">
      <header>
        <h1>הצעד הבא</h1>
        <p>ניהול חיפוש העבודה שלי</p>
      </header>

      <div>
        <label>
          חיפוש לפי תפקיד או חברה{" "}
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>
      </div>

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

      {showNoMatches ? (
        <p role="status">
          {query !== ""
            ? "לא נמצאו משרות מתאימות"
            : "אין משרות בסטטוס שנבחר"}
        </p>
      ) : (
        <JobList jobs={visibleJobs} />
      )}

      <JobForm onAddJob={onAddJob} />
    </main>
  );
}