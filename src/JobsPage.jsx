import { useState } from "react";
import styled from "styled-components";
import JobList from "./JobList.jsx";
import JobForm from "./JobForm.jsx";
import { statuses } from "./jobStatuses.js";

const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto 24px;
  padding: 24px 16px;
  border-bottom: 1px solid #dbe4f0;
  text-align: start;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const PageBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    flex-shrink: 0;
    width: clamp(36px, 8vw, 56px);
    height: auto;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  color: #0f2044;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.15;
`;

const PageSubtitle = styled.p`
  margin: 6px 0 0;
  color: #475569;
  font-size: 1rem;
`;

const AddJobLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  background-color: #087f83;
  color: #fff;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background-color: #066b70;
    color: #fff;
  }

  &:focus-visible {
    outline: 2px solid #0f2044;
    outline-offset: 3px;
  }
`;

const SummaryGrid = styled.section`
  display: grid;
  gap: 12px;
  max-width: 1120px;
  margin: 20px auto;
  padding-inline: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const SummaryCard = styled.div`
  display: grid;
  gap: 4px;
  padding: 14px 18px;
  border: 1px solid #c4dcf5;
  border-radius: 14px;
  background: #eaf4ff;
  color: #102044;
  text-align: start;

  &:nth-child(2) {
    border-color: #b9e5da;
    background: #e8f7f3;
  }

  strong {
    font-size: 1.75rem;
    line-height: 1.2;
  }
`;

const FilterBar = styled.div`
  display: grid;
  gap: 12px;
  max-width: 1120px;
  margin: 20px auto;
  padding-inline: 16px;

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
  }
`;

const FilterField = styled.label`
  display: grid;
  gap: 6px;
  min-width: 0;
  color: #102044;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: start;

  input,
  select {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid #b6c6d9;
    border-radius: 10px;
    background: #fff;
    color: #102044;
    font: inherit;
  }

  input:focus-visible,
  select:focus-visible {
    outline: 2px solid #087f83;
    outline-offset: 2px;
  }
`;

const SearchField = styled.span`
  position: relative;
  display: block;

  && input {
    padding-inline-start: 42px;
  }

  svg {
    position: absolute;
    inset-inline-start: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    pointer-events: none;
  }
`;

const titleCollator = new Intl.Collator("he", { sensitivity: "base" });

export default function JobsPage({
  jobs,
  onAddJob,
  onToggleFavorite,
  onDeleteJob,
}) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const sentCount = jobs.filter(
    (job) => job.status === "נשלחו קורות חיים",
  ).length;

  const interviewCount = jobs.filter(
    (job) => job.status === "נקבע ראיון",
  ).length;

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
    const matchesFavorites = !favoritesOnly || job.isFavorite === true;

    return matchesStatus && matchesSearch && matchesFavorites;
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

  let noMatchesMessage = "לא נמצאו משרות מתאימות";

  if (favoritesOnly && query === "" && selectedStatus === "") {
    noMatchesMessage = "אין משרות מועדפות להצגה";
  } else if (!favoritesOnly && query === "" && selectedStatus !== "") {
    noMatchesMessage = "אין משרות בסטטוס שנבחר";
  }

  return (
    <main dir="rtl">
      <PageHeader>
        <PageBrand>
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M4 38h12v-8h10v-8h12v24H4z" fill="#00a6b4" />
            <path d="M34 23V4" stroke="#0f2044" strokeWidth="2" />
            <path d="M35 4l11 5-11 5z" fill="#087f83" />
          </svg>

          <div>
            <PageTitle>הצעד הבא</PageTitle>
            <PageSubtitle>ניהול חיפוש העבודה שלי</PageSubtitle>
          </div>
        </PageBrand>

        <AddJobLink href="#add-job">
          <span aria-hidden="true">+</span>
          הוספת משרה
        </AddJobLink>
      </PageHeader>

      <SummaryGrid aria-label="סיכום חיפוש העבודה">
        <SummaryCard>
          <span>משרות ששמרתי</span>
          <strong>{jobs.length}</strong>
        </SummaryCard>

        <SummaryCard>
          <span>קורות חיים נשלחו</span>
          <strong>{sentCount}</strong>
        </SummaryCard>

        <SummaryCard>
          <span>ראיונות שנקבעו</span>
          <strong>{interviewCount}</strong>
        </SummaryCard>
      </SummaryGrid>

      <FilterBar>
        <FilterField>
          חיפוש לפי תפקיד או חברה
          <SearchField>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </SearchField>
        </FilterField>

        <FilterField>
          סינון לפי סטטוס
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
        </FilterField>

        <FilterField>
          מיון לפי שם התפקיד
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="">סדר רגיל</option>
            <option value="asc">סדר אלפביתי עולה</option>
            <option value="desc">סדר אלפביתי יורד</option>
          </select>
        </FilterField>
      </FilterBar>

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
        <JobList
          jobs={sortedJobs}
          onToggleFavorite={onToggleFavorite}
          onDeleteJob={onDeleteJob}
        />
      )}

      <div id="add-job" tabIndex={-1}>
        <JobForm onAddJob={onAddJob} />
      </div>
    </main>
  );
}