import styled from "styled-components";
import JobCard from "./JobCard.jsx";

const JobsGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  max-width: 1120px;
  margin: 24px auto;
  padding-inline: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export default function JobList({ jobs }) {
  if (jobs.length === 0) {
    return <p>אין משרות להצגה.</p>;
  }

  return (
    <JobsGrid aria-label="רשימת משרות">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </JobsGrid>
  );
}