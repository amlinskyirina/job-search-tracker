import styled from "styled-components";
import { Link, useParams } from "react-router";

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

export default function JobDetailsPage({ jobs }) {
  const { jobId } = useParams();
  const job = jobs.find((item) => String(item.id) === jobId);

  if (!job) {
    return (
      <Page dir="rtl">
        <h1>המשרה לא נמצאה</h1>
        <Link to="/">חזרה לרשימת המשרות</Link>
      </Page>
    );
  }

  const jobUrl = job.url || "";
  const hasJobLink = /^https?:\/\//i.test(jobUrl);

  return (
    <Page dir="rtl">
      <Link to="/">חזרה לרשימת המשרות</Link>

      <h1><bdi>{job.title}</bdi></h1>
      <p>חברה: <bdi>{job.company}</bdi></p>
      <p>עיר: {job.city}</p>
      <p>סטטוס: {job.status}</p>

      {job.notes && <Notes>הערות: {job.notes}</Notes>}
      {hasJobLink && <a href={jobUrl}>למודעת המשרה</a>}
    </Page>
  );
}