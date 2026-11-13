import { useState } from "react";
import styled from "styled-components";
import { statuses } from "./jobStatuses.js";

const Form = styled.form`
  max-width: 1120px;
  margin: 24px auto;
  padding: 20px;
  border: 1px solid #cbdcf0;
  border-radius: 14px;
  background-color: #eaf4ff;
  text-align: right;
`;

const Fields = styled.div`
  display: grid;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  align-content: start;
  gap: 6px;
  font-weight: 600;

  & > input,
  & > select,
  & > textarea {
    min-width: 0;
    padding: 8px;
    border: 1px solid #a8b8cc;
    border-radius: 8px;
    background-color: white;
    color: #0f172a;
    font: inherit;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const SaveButton = styled.button`
  padding: 8px 20px;
  border: 0;
  border-radius: 8px;
  background-color: #087f83;
  color: white;
  cursor: pointer;
`;

export default function JobForm({ onAddJob, initialJob, onCancel }) {
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = Boolean(initialJob);
  const initialStatus = initialJob?.status ?? "";

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const job = {
      title: formData.get("title").trim(),
      company: formData.get("company").trim(),
      city: formData.get("city").trim(),
      status: formData.get("status"),
      url: formData.get("url").trim(),
      notes: formData.get("notes").trim(),
    };

    // גם שדה שמכיל רק רווחים נחשב ריק.
    if (!job.title || !job.company || !job.city || !job.status) {
      console.warn("שמירת המשרה נעצרה: אחד משדות החובה ריק.");
      setErrorMessage("יש למלא את כל שדות החובה.");
      return;
    }

    setErrorMessage("");
    onAddJob(job);

    if (!isEditing) {
      form.reset();
    }
  }

  return (
    <Form onSubmit={handleSubmit} onReset={() => setErrorMessage("")}>
      <h2>{isEditing ? "עריכת פרטי המשרה" : "הוספת משרה"}</h2>

      <Fields>
        <Field>
          שם התפקיד *
          <input name="title" defaultValue={initialJob?.title ?? ""} required />
        </Field>

        <Field>
          שם החברה *
          <input name="company" defaultValue={initialJob?.company ?? ""} required />
        </Field>

        <Field>
          עיר *
          <input name="city" defaultValue={initialJob?.city ?? ""} required />
        </Field>

        <Field>
          קישור למודעה
          <input
            name="url"
            type="url"
            placeholder="https://..."
            dir="ltr"
            defaultValue={initialJob?.url ?? ""}
          />
        </Field>

        <Field>
          סטטוס *
          <select name="status" defaultValue={initialStatus} required>
            <option value="" disabled>בחרי סטטוס</option>

            {initialStatus && !statuses.includes(initialStatus) && (
              <option value={initialStatus}>{initialStatus}</option>
            )}

            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </Field>

        <Field>
          הערות
          <textarea name="notes" rows={2} defaultValue={initialJob?.notes ?? ""} />
        </Field>
      </Fields>

      {errorMessage && (
  <p role="alert" style={{ color: "#b91c1c" }}>
    {errorMessage}
  </p>
)}

      <Actions>
        <SaveButton type="submit">שמירה</SaveButton>

        {isEditing ? (
          <button type="button" onClick={onCancel}>ביטול</button>
        ) : (
          <button type="reset">ביטול</button>
        )}
      </Actions>
    </Form>
  );
}