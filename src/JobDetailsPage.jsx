import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import styled from "styled-components";
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
`;

export default function JobDetailsPage({ jobs, onEditJob, onDeleteJob }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [editingJobId, setEditingJobId] = useState(null);
  const job = jobs.find((item) => String(item.id) === jobId);

  if (!job) {
    return (
      <Page dir="rtl">
        <h1>המשרה לא נמצאה</h1>
        <Link to="/">חזרה לרשימת המשרות</Link>
      </Page>
    );
  }

  const isEditing = editingJobId === jobId;
  const jobUrl = job.url || "";
  const hasJobLink = /^https?:\/\//i.test(jobUrl);

  function handleSave(updatedFields) {
    onEditJob(job.id, updatedFields);
    setEditingJobId(null);
  }

  function handleDelete() {
    const confirmed = window.confirm(`למחוק את המשרה "${job.title}"?`);

    if (!confirmed) {
      return;
    }

    onDeleteJob(job.id);
    navigate("/", { replace: true });
  }

  return (
    <Page dir="rtl">
      <Link to="/">חזרה לרשימת המשרות</Link>

      <h1><bdi>{job.title}</bdi></h1>
      <p>חברה: <bdi>{job.company}</bdi></p>
      <p>עיר: {job.city}</p>
      <p>סטטוס: {job.status}</p>

      {job.notes && <Notes>הערות: {job.notes}</Notes>}
      {hasJobLink && <a href={jobUrl}>למודעת המשרה</a>}

      <Actions>
        <button
          type="button"
          aria-expanded={isEditing}
          onClick={() => setEditingJobId(isEditing ? null : jobId)}
        >
          {isEditing ? "ביטול עריכה" : "עריכת משרה"}
        </button>

        <button type="button" onClick={handleDelete}>
          מחיקת משרה
        </button>
      </Actions>

      {isEditing && (
        <JobForm
          key={job.id}
          initialJob={job}
          onAddJob={handleSave}
          onCancel={() => setEditingJobId(null)}
        />
      )}
    </Page>
  );
}