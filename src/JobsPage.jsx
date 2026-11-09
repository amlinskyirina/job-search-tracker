import JobCard from "./JobCard.jsx";

export default function JobsPage() {
  return (
    <main lang="he" dir="rtl">
      <header>
        <h1>הצעד הבא</h1>
        <p>ניהול חיפוש העבודה שלי</p>
      </header>

      <section>
        <h2>המשרות שלי</h2>
        <JobCard
          title="Junior QA"
          company="North Test"
          city="חיפה"
          status="נשמרה"
        />
      </section>
    </main>
  );
}