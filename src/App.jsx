import JobsPage from "./JobsPage.jsx";
import { sampleJobs } from "./sampleJobs.js";

export default function App() {
  // מעבירים את מערך משרות הדוגמה למסך הראשי
  return <JobsPage jobs={sampleJobs} />;
}