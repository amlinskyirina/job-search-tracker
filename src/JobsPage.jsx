import JobList from "./JobList.jsx";

export default function JobsPage({ jobs }) {
  return (
    <main dir="rtl">
      <header>
        <h1>הצעד הבא</h1>
        <p>ניהול חיפוש העבודה שלי</p>
      </header>

      <JobList jobs={jobs} />
    </main>
  );
}