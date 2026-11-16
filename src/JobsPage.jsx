import { useState } from "react";
import JobList from "./JobList.jsx";
import JobForm from "./JobForm.jsx";
import { statuses } from "./jobStatuses.js";

const titleCollator = new Intl.Collator("he", { sensitivity: "base" });

export default function JobsPage({ jobs, onAddJob }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("");

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

  const sortedJobs =
    sortOrder === ""
      ? visibleJobs
      : [...visibleJobs].sort((firstJob, secondJob) => {
          if (sortOrder === "newest" || sortOrder === "oldest") {
            const firstDate = Date.parse(firstJob.createdAt);
            const secondDate = Date.parse(secondJob.createdAt);

            // משרות ללא תאריך תקין מופיעות בסוף בשני כיווני המיון.
            if (!Number.isFinite(firstDate)) {
              return Number.isFinite(secondDate) ? 1 : 0;
            }

            if (!Number.isFinite(secondDate)) {
              return -1;
            }

            return sortOrder === "newest"
              ? secondDate - firstDate
              : firstDate - secondDate;
          }

          const comparison = titleCollator.compare(
            firstJob.title ?? "",
            secondJob.title ?? "",
          );

          return sortOrder === "asc" ? comparison : -comparison;
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

      <div>
        <label>
          מיון משרות{" "}
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="">סדר רגיל</option>
            <option value="asc">סדר אלפביתי עולה</option>
            <option value="desc">סדר אלפביתי יורד</option>
            <option value="newest">מהחדשות לישנות</option>
            <option value="oldest">מהישנות לחדשות</option>
          </select>
        </label>
      </div>

      {showNoMatches ? (
        <p role="status">
          {query !== ""
            ? "לא נמצאו משרות מתאימות"
            : "אין משרות בסטטוס שנבחר"}
        </p>
      ) : (
        <JobList jobs={sortedJobs} />
      )}

      <JobForm onAddJob={onAddJob} />
    </main>
  );
}