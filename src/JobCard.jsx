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

export default function JobCard({ job, onToggleFavorite }) {
  const colors = statusColors[job.status] ?? defaultStatusColors;
  const isFavorite = job.isFavorite === true;

  return (
    <Card dir="rtl">
      <CardHeader>
        <StatusBadge $colors={colors}>{job.status}</StatusBadge>

        <FavoriteButton
          type="button"
          aria-label={`משרה מועדפת: ${job.title}`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(job.id)}
        >
          <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
        </FavoriteButton>
      </CardHeader>

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