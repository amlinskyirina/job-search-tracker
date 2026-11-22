import { useRef, useState } from "react";
import { Link } from "react-router";
import styled from "styled-components";
import DeleteJobModal from "./DeleteJobModal.jsx";

const statusColors = {
  נשמרה: { background: "#ede9fe", text: "#4c1d95" },
  "נשלחו קורות חיים": { background: "#dbeafe", text: "#1e40af" },
  "נקבע ראיון": { background: "#d1fae5", text: "#065f46" },
  "התקבלה הצעה": { background: "#fef3c7", text: "#854d0e" },
  "התהליך הסתיים": { background: "#ffedd5", text: "#9a3412" },
};

const defaultStatusColors = {
  background: "#f1f5f9",
  text: "#475569",
};

const dateFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const iconPaths = {
  laptop: "M4 17V6h16v11M4 17h16l2 3H2l2-3Z",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6M14 4l-4 16",
  flask:
    "M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10",
  building:
    "M3 21h18M5 21V4h10v17m0-12h4v12M8 8h1m2 0h1M8 12h1m2 0h1M8 16h1m2 0h1",
  pin:
    "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v5m8-5v5",
  external: "M13 5h6v6m0-6-9 9M19 13v6H5V5h6",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5",
  edit: "m14 6 4 4M5 19l4-1L20 7l-4-4L5 14l-1 5Z",
};

const Card = styled.article`
  box-sizing: border-box;
  min-width: 0;
  padding: 16px;
  border: 1px solid #ccd9ee;
  border-radius: 14px;
  background-color: #fff;
  box-shadow: 0 2px 5px #10204412;
  text-align: start;
  overflow-wrap: anywhere;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background-color: ${({ $colors }) => $colors.background};
  color: ${({ $colors }) => $colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const FavoriteButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background-color: #fff;
  color: #475569;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;

  &[aria-pressed="true"] {
    border-color: #a16207;
    background-color: #fef3c7;
    color: #854d0e;
  }

  &:focus-visible {
    outline: 2px solid #1e40af;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

const JobInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 12px;
`;

const JobText = styled.div`
  min-width: 0;
`;

const JobIconTile = styled.span`
  display: grid;
  flex: 0 0 44px;
  height: 44px;
  place-items: center;
  border-radius: 10px;
  background-color: #e0efff;
  color: #075db3;

  &[data-kind="code"] {
    background-color: #ede9fe;
    color: #5b21b6;
  }

  &[data-kind="flask"] {
    background-color: #dcfce7;
    color: #047857;
  }
`;

const JobTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 20px;
  line-height: 1.3;
`;

const JobTitleLink = styled(Link)`
  color: #0f2044;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid #087f83;
    outline-offset: 3px;
    border-radius: 3px;
  }
`;

const JobDetail = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 4px 0 0;
  color: #475569;

  svg {
    flex-shrink: 0;
    margin-top: 3px;
    color: #0f2044;
  }

  span {
    min-width: 0;
  }
`;

const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;

  a,
  button {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding-inline: 10px;
    border: 1px solid #bac9dc;
    border-radius: 8px;
    background: #f8fafc;
    color: #0f2044;
    font: inherit;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
  }

  [data-action="external"] {
    border-color: #80b4ff;
    background: #eff6ff;
    color: #075db3;
  }

  [data-action="delete"] {
    border-color: #fca5a5;
    background: #fff5f5;
    color: #b91c1c;
  }

  a:focus-visible,
  button:focus-visible {
    outline: 2px solid #087f83;
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

const ErrorMessage = styled.p`
  margin: 12px 0 0;
  color: #b91c1c;
`;

function JobIcon({ name, size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

function getJobIconName(title) {
  if (/\b(QA|tester|testing)\b|בדיקות/i.test(title)) {
    return "flask";
  }

  if (/\b(React|JavaScript|backend|full[\s-]?stack)\b|פיתוח/i.test(title)) {
    return "code";
  }

  return "laptop";
}

export default function JobCard({
  job,
  onToggleFavorite,
  onDeleteJob,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const operationRef = useRef(false);

  const colors = statusColors[job.status] ?? defaultStatusColors;
  const isFavorite = job.isFavorite === true;
  const iconName = getJobIconName(job.title ?? "");
  const detailsPath = `/jobs/${job.id}`;
  const jobUrl = job.url?.trim() ?? "";
  const hasJobLink = /^https?:\/\//i.test(jobUrl);
  const creationTimestamp = Date.parse(job.createdAt);
  const hasCreationDate = Number.isFinite(creationTimestamp);
  const isBusy = isDeleting || isUpdatingFavorite;

  async function handleToggleFavorite() {
    if (operationRef.current || !onToggleFavorite) return;

    operationRef.current = true;
    setIsUpdatingFavorite(true);
    setErrorMessage("");

    try {
      const success = await onToggleFavorite(job.id);

      if (success === false) {
        setErrorMessage("עדכון המועדפות נכשל. נסי שוב.");
      }
    } catch (error) {
      console.error(
        "עדכון המועדפות נכשל",
        error?.code ?? error?.name,
      );
      setErrorMessage("עדכון המועדפות נכשל. נסי שוב.");
    } finally {
      operationRef.current = false;
      setIsUpdatingFavorite(false);
    }
  }

  function openDeleteModal() {
    if (operationRef.current) return;

    setErrorMessage("");
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (operationRef.current) return;

    setIsDeleteModalOpen(false);
  }

  async function handleConfirmDelete() {
    if (operationRef.current || !onDeleteJob) return false;

    operationRef.current = true;
    setIsDeleting(true);

    try {
      const success = await onDeleteJob(job.id);

      if (success === false) return false;

      setIsDeleteModalOpen(false);
      return true;
    } catch (error) {
      console.error(
        "מחיקת המשרה נכשלה",
        error?.code ?? error?.name,
      );
      return false;
    } finally {
      operationRef.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <Card dir="rtl" aria-busy={isBusy}>
      <CardHeader>
        <StatusBadge $colors={colors}>
          {job.status}
        </StatusBadge>

        {onToggleFavorite && (
          <FavoriteButton
            type="button"
            aria-label={`משרה מועדפת: ${job.title}`}
            aria-pressed={isFavorite}
            disabled={isBusy}
            onClick={handleToggleFavorite}
          >
            <span aria-hidden="true">
              {isFavorite ? "★" : "☆"}
            </span>
          </FavoriteButton>
        )}
      </CardHeader>

      <JobInfo>
        <JobIconTile data-kind={iconName}>
          <JobIcon name={iconName} />
        </JobIconTile>

        <JobText>
          <JobTitle>
            <JobTitleLink to={detailsPath}>
              <bdi>{job.title}</bdi>
            </JobTitleLink>
          </JobTitle>

          <JobDetail>
            <JobIcon name="building" size={16} />
            <span>
              חברה: <bdi>{job.company}</bdi>
            </span>
          </JobDetail>

          <JobDetail>
            <JobIcon name="pin" size={16} />
            <span>
              עיר: <bdi>{job.city}</bdi>
            </span>
          </JobDetail>

          <JobDetail>
            <JobIcon name="calendar" size={16} />
            <span>
              תאריך הוספה:{" "}
              {hasCreationDate ? (
                <time
                  dateTime={new Date(creationTimestamp).toISOString()}
                >
                  {dateFormatter.format(creationTimestamp)}
                </time>
              ) : (
                "לא זמין"
              )}
            </span>
          </JobDetail>
        </JobText>
      </JobInfo>

      <CardActions>
        {hasJobLink && (
          <a
            href={jobUrl}
            data-action="external"
            target="_blank"
            rel="noopener noreferrer"
          >
            <JobIcon name="external" size={16} />
            למודעה
          </a>
        )}

        {onDeleteJob && (
          <button
            type="button"
            data-action="delete"
            disabled={isBusy}
            onClick={openDeleteModal}
          >
            <JobIcon name="trash" size={16} />
            {isDeleting ? "מוחקת..." : "מחיקה"}
          </button>
        )}

        <Link to={`${detailsPath}?edit=1`}>
          <JobIcon name="edit" size={16} />
          עריכה
        </Link>
      </CardActions>

      {errorMessage && (
        <ErrorMessage role="alert">
          {errorMessage}
        </ErrorMessage>
      )}

      {isDeleteModalOpen && (
        <DeleteJobModal
          jobTitle={job.title}
          onCancel={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Card>
  );
}