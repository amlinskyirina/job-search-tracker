import JobList from "./JobList.jsx";
import JobForm from "./JobForm.jsx";

export default function JobsPage({ jobs, onAddJob }) {
  return (
    <main dir="rtl">
      <header>
        <h1>הצעד הבא</h1>
        <p>ניהול חיפוש העבודה שלי</p>
      </header>

      <JobList jobs={jobs} />
      <JobForm onAddJob={onAddJob} />
    </main>
  );
}