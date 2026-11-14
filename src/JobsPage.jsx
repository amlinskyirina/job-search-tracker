import { useState } from "react";
import JobList from "./JobList.jsx";
import JobForm from "./JobForm.jsx";
import { statuses } from "./jobStatuses.js";

const titleCollator = new Intl.Collator("he", { sensitivity: "base" });

export default function JobsPage({ jobs, onAddJob, onToggleFavorite }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

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
    const matchesFavorite = !favoritesOnly || job.isFavorite === true;

    return matchesStatus && matchesSearch && matchesFavorite;
  });

  const sortedJobs =
    sortOrder === ""
      ? visibleJobs
      : [...visibleJobs].sort((firstJob, secondJob) => {
          const comparison = titleCollator.compare(
            firstJob.title ?? "",
            secondJob.title ?? "",
          );

          return sortOrder === "asc" ? comparison : -comparison;
        });

  const showNoMatches =
    visibleJobs.length === 0 &&
    (query !== "" || selectedStatus !== "" || favoritesOnly);

  let noMatchesMessage = "אין משרות בסטטוס שנבחר";

  if (favoritesOnly) {
    noMatchesMessage = "לא נמצאו משרות מועדפות מתאימות";
  } else if (query !== "") {
    noMatchesMessage = "לא נמצאו משרות מתאימות";
  }

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

      <div>
        <label>
          מיון לפי שם התפקיד{" "}
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="">סדר רגיל</option>
            <option value="asc">סדר אלפביתי עולה</option>
            <option value="desc">סדר אלפביתי יורד</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />{" "}
          מועדפות בלבד
        </label>
      </div>

      {showNoMatches ? (
        <p role="status">{noMatchesMessage}</p>
      ) : (
        <JobList jobs={sortedJobs} onToggleFavorite={onToggleFavorite} />
      )}

      <JobForm onAddJob={onAddJob} />
    </main>
  );
}