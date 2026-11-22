import { useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import styled from "styled-components";
import DeleteJobModal from "./DeleteJobModal.jsx";
import JobForm from "./JobForm.jsx";

const Page = styled.main`
  box-sizing: border-box;
  width: calc(100% - 32px);
  max-width: 720px;
  margin: 32px auto;
  padding: 24px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background-color: #fff;
  color: #0f172a;
  text-align: right;
  overflow-wrap: anywhere;

  & a {
    color: #1e40af;
    text-decoration: underline;
  }
`;

const Notes = styled.p`
  white-space: pre-wrap;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;

  button {
    min-height: 44px;
    padding: 8px 16px;
    border: 1px solid #a8b8cc;
    border-radius: 8px;
    background-color: #fff;
    color: #0f2044;
    font: inherit;
    cursor: pointer;
  }

  button:focus-visible {
    outline: 2px solid #087f83;
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  [data-action="delete"] {
    border-color: #fca5a5;
    color: #b91c1c;
  }
`;

const ErrorMessage = styled.p`
  color: #b91c1c;
`;

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return null;

  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function JobDetailsPage({
  jobs,
  onEditJob,
  onDeleteJob,
}) {
  const { jobId } = useParams();

  // מאפס מצב פנימי כשעוברים למשרה אחרת.
  return (
    <JobDetails
      key={jobId}
      jobId={jobId}
      jobs={jobs}
      onEditJob={onEditJob}
      onDeleteJob={onDeleteJob}
    />
  );
}

function JobDetails({ jobId, jobs, onEditJob, onDeleteJob }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const operationRef = useRef(false);

  const job = jobs.find((item) => String(item.id) === jobId);
  const isEditing = searchParams.get("edit") === "1";
  const isBusy = isSaving || isDeleting;

  function setEditing(shouldEdit) {
    if (operationRef.current) return;

    const nextParams = new URLSearchParams(searchParams);

    if (shouldEdit) {
      nextParams.set("edit", "1");
    } else {
      nextParams.delete("edit");
    }

    setErrorMessage("");
    setSearchParams(nextParams, { replace: true });
  }

  async function handleSave(updatedFields) {
    if (!job || operationRef.current) return false;

    operationRef.current = true;
    setIsSaving(true);
    setErrorMessage("");

    try {
      const success = await onEditJob(job.id, updatedFields);

      if (success === false) {
        setErrorMessage("השמירה נכשלה. נסי שוב.");
        return false;
      }

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("edit");
      setSearchParams(nextParams, { replace: true });

      return true;
    } catch (error) {
      console.error(
        "עריכת המשרה נכשלה",
        error?.code ?? error?.name,
      );

      setErrorMessage("השמירה נכשלה. נסי שוב.");
      return false;
    } finally {
      operationRef.current = false;
      setIsSaving(false);
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
    if (!job || operationRef.current) return false;

    operationRef.current = true;
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const success = await onDeleteJob(job.id);

      if (success === false) {
        setIsDeleteModalOpen(false);
        setErrorMessage("המחיקה נכשלה. נסי שוב.");
        return false;
      }

      setIsDeleteModalOpen(false);
      navigate("/", { replace: true });

      return true;
    } catch (error) {
      console.error(
        "מחיקת המשרה נכשלה",
        error?.code ?? error?.name,
      );

      setIsDeleteModalOpen(false);
      setErrorMessage("המחיקה נכשלה. נסי שוב.");
      return false;
    } finally {
      operationRef.current = false;
      setIsDeleting(false);
    }
  }

  if (!job) {
    return (
      <Page dir="rtl">
        {isDeleting ? (
          <p role="status">מסיימת את מחיקת המשרה...</p>
        ) : (
          <>
            <h1>המשרה לא נמצאה</h1>
            <p>ייתכן שהמשרה נמחקה או שאינה שייכת לחשבון המחובר.</p>
          </>
        )}

        <Link to="/">חזרה לרשימת המשרות</Link>
      </Page>
    );
  }

  const jobUrl = job.url?.trim() ?? "";
  const hasJobLink = /^https?:\/\//i.test(jobUrl);
  const createdDate = formatDate(job.createdAt);

  return (
    <Page dir="rtl" aria-busy={isBusy}>
      <Link to="/">חזרה לרשימת המשרות</Link>

      <h1>
        <bdi>{job.title}</bdi>
      </h1>

      <p>
        חברה: <bdi>{job.company}</bdi>
      </p>

      <p>
        עיר: <bdi>{job.city}</bdi>
      </p>

      <p>סטטוס: {job.status}</p>

      <p>
        תאריך הוספה:{" "}
        {createdDate ? (
          <time dateTime={job.createdAt}>{createdDate}</time>
        ) : (
          "לא זמין"
        )}
      </p>

      {job.notes && (
        <Notes>
          הערות: {job.notes}
        </Notes>
      )}

      {hasJobLink && (
        <a
          href={jobUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          למודעת המשרה
        </a>
      )}

      <Actions>
        <button
          type="button"
          aria-expanded={isEditing}
          aria-controls="job-edit-form"
          disabled={isBusy}
          onClick={() => setEditing(!isEditing)}
        >
          {isEditing ? "ביטול עריכה" : "עריכת משרה"}
        </button>

        <button
          type="button"
          data-action="delete"
          disabled={isBusy}
          onClick={openDeleteModal}
        >
          {isDeleting ? "מוחקת..." : "מחיקת משרה"}
        </button>
      </Actions>

      {errorMessage && (
        <ErrorMessage role="alert">
          {errorMessage}
        </ErrorMessage>
      )}

      {isEditing && (
        <div id="job-edit-form">
          <JobForm
            key={job.id}
            initialJob={job}
            onAddJob={handleSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {isDeleteModalOpen && (
        <DeleteJobModal
          jobTitle={job.title}
          onCancel={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Page>
  );
}