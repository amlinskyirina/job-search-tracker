export default function JobCard({ title, company, city, status }) {
  return (
    <article>
      <h3>{title}</h3>
      <p>חברה: {company}</p>
      <p>עיר: {city}</p>
      <p>סטטוס: {status}</p>
    </article>
  );
}