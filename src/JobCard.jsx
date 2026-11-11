import styled from "styled-components";
import { Link } from "react-router";

const statusColors = {
  "נשמרה": { background: "#ede9fe", text: "#4c1d95" },
  "נשלחו קורות חיים": { background: "#dbeafe", text: "#1e40af" },
  "נקבע ראיון": { background: "#d1fae5", text: "#065f46" },
  "התקבלה הצעה": { background: "#fef3c7", text: "#854d0e" },
  "התהליך הסתיים": { background: "#ffedd5", text: "#9a3412" },
};

const defaultStatusColors = { background: "#f1f5f9", text: "#475569" };

const Card = styled.article`
  padding: 16px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background-color: #fff;
  box-shadow: 0 2px 6px #0f172a14;
  text-align: right;
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

const JobTitle = styled.h2`
  margin: 12px 0 8px;
  font-size: 20px;
`;

const JobTitleLink = styled(Link)`
  color: #1e40af;
  text-decoration: underline;
`;

const JobDetail = styled.p`
  margin: 4px 0 0;
  color: #475569;
`;

export default function JobCard({ job }) {
  const colors = statusColors[job.status] ?? defaultStatusColors;

  return (
    <Card dir="rtl">
      <StatusBadge $colors={colors}>{job.status}</StatusBadge>

      <JobTitle>
        <JobTitleLink to={`/jobs/${job.id}`}>
          <bdi>{job.title}</bdi>
        </JobTitleLink>
      </JobTitle>

      <JobDetail>חברה: <bdi>{job.company}</bdi></JobDetail>
      <JobDetail>עיר: {job.city}</JobDetail>
    </Card>
  );
}