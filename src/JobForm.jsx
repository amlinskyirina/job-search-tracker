import { useRef, useState } from "react";
import styled from "styled-components";
import { statuses } from "./jobStatuses.js";

const requiredFieldsMessage = "יש למלא את כל שדות החובה.";

const iconPaths = {
  plus: "M12 5v14M5 12h14",
  edit: "m14 6 4 4M5 19l4-1L20 7l-4-4L5 14l-1 5Z",
  link: "M10 13a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7M14 11a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7",
  save: "M5 3h12l4 4v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1ZM7 3v6h10V3M7 21v-8h10v8",
};

function FormIcon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const Form = styled.form`
  box-sizing: border-box;
  max-width: 1120px;
  margin: 24px auto;
  padding: 20px;
  border: 1px solid #cbdcf0;
  border-radius: 14px;
  background-color: #eaf4ff;
  text-align: right;
`;

const FormHeading = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  color: #0f2044;
`;

const HeadingIcon = styled.span`
  display: grid;
  flex: 0 0 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background-color: #087f83;
  color: #fff;
`;

const Fields = styled.fieldset`
  display: grid;
  gap: 16px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
  font-weight: 600;

  input,
  select,
  textarea {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 8px;
    border: 1px solid #a8b8cc;
    border-radius: 8px;
    background-color: #fff;
    color: #0f172a;
    font: inherit;
  }

  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid #087f83;
    outline-offset: 2px;
  }

  input:disabled,
  select:disabled,
  textarea:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  textarea {
    resize: vertical;
  }
`;

const UrlField = styled.span`
  position: relative;
  display: block;

  && input {
    padding-right: 38px;
  }

  svg {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    pointer-events: none;
  }
`;

const ErrorMessage = styled.p`
  margin: 12px 0 0;
  color: #b91c1c;
`;

const StatusMessage = styled.p`
  margin: 12px 0 0;
  color: #065f46;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;

  button:focus-visible {
    outline: 2px solid #0f2044;
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.65;
    cursor: wait;
  }
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 20px;
  border: 0;
  border-radius: 8px;
  background-color: #087f83;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #066b70;
  }
`;

const CancelButton = styled.button`
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid #a8b8cc;
  border-radius: 8px;
  background-color: #fff;
  color: #0f2044;
  font: inherit;
  cursor: pointer;
`;

export default function JobForm({ onAddJob, initialJob, onCancel }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const isEditing = Boolean(initialJob);
  const initialStatus = initialJob?.status ?? "";

  function handleInvalid(event) {
    setSuccessMessage("");

    if (event.target.validity.valueMissing) {
      setErrorMessage(requiredFieldsMessage);
    } else if (event.target.name === "url") {
      setErrorMessage("יש להזין קישור תקין שמתחיל ב־http:// או ב־https://.");
    }
  }

  function handleReset(event) {
    if (savingRef.current) {
      event.preventDefault();
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // מונע שליחה כפולה גם לפני ש-React מעדכן את הכפתור.
    if (savingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const job = {
      title: String(formData.get("title") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      status: String(formData.get("status") ?? "").trim(),
      url: String(formData.get("url") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };

    setErrorMessage("");
    setSuccessMessage("");

    if (!job.title || !job.company || !job.city || !job.status) {
      setErrorMessage(requiredFieldsMessage);
      return;
    }

    if (job.url) {
      try {
        const url = new URL(job.url);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Unsupported URL protocol");
        }
      } catch {
        setErrorMessage(
          "יש להזין קישור תקין שמתחיל ב־http:// או ב־https://.",
        );
        return;
      }
    }

    savingRef.current = true;
    setIsSaving(true);

    try {
      const success = await onAddJob(job);

      if (success === false) {
        setErrorMessage(
          "השמירה נכשלה. הפרטים נשארו בטופס. נסי שוב.",
        );
        return;
      }

      if (!isEditing) {
        // מאפשר איפוס רק לאחר שהשמירה הצליחה.
        savingRef.current = false;
        form.reset();
        setSuccessMessage("המשרה נשמרה בהצלחה.");
      }
    } catch (error) {
      console.error("שמירת המשרה נכשלה", error?.code ?? error?.name);

      setErrorMessage(
        "השמירה נכשלה. הפרטים נשארו בטופס. נסי שוב.",
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Form
      dir="rtl"
      aria-label={isEditing ? "עריכת פרטי המשרה" : "הוספת משרה"}
      aria-busy={isSaving}
      onSubmit={handleSubmit}
      onInvalidCapture={handleInvalid}
      onReset={handleReset}
    >
      <FormHeading>
        <HeadingIcon>
          <FormIcon name={isEditing ? "edit" : "plus"} />
        </HeadingIcon>

        {isEditing ? "עריכת פרטי המשרה" : "הוספת משרה"}
      </FormHeading>

      <Fields disabled={isSaving}>
        <Field>
          שם התפקיד *
          <input
            name="title"
            defaultValue={initialJob?.title ?? ""}
            required
          />
        </Field>

        <Field>
          שם החברה *
          <input
            name="company"
            defaultValue={initialJob?.company ?? ""}
            required
          />
        </Field>

        <Field>
          עיר *
          <input
            name="city"
            defaultValue={initialJob?.city ?? ""}
            required
          />
        </Field>

        <Field>
          קישור למודעה
          <UrlField>
            <input
              name="url"
              type="url"
              placeholder="https://..."
              dir="ltr"
              defaultValue={initialJob?.url ?? ""}
            />
            <FormIcon name="link" size={16} />
          </UrlField>
        </Field>

        <Field>
          סטטוס *
          <select
            name="status"
            defaultValue={initialStatus}
            required
          >
            <option value="" disabled>
              בחרי סטטוס
            </option>

            {initialStatus && !statuses.includes(initialStatus) && (
              <option value={initialStatus}>
                {initialStatus}
              </option>
            )}

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          הערות
          <textarea
            name="notes"
            rows={2}
            defaultValue={initialJob?.notes ?? ""}
          />
        </Field>
      </Fields>

      {errorMessage && (
        <ErrorMessage role="alert">
          {errorMessage}
        </ErrorMessage>
      )}

      {successMessage && (
        <StatusMessage role="status">
          {successMessage}
        </StatusMessage>
      )}

      <Actions>
        <SaveButton type="submit" disabled={isSaving}>
          <FormIcon name="save" />
          {isSaving ? "שומרת..." : "שמירה"}
        </SaveButton>

        {isEditing ? (
          <CancelButton
            type="button"
            onClick={onCancel}
            disabled={isSaving}
          >
            ביטול
          </CancelButton>
        ) : (
          <CancelButton type="reset" disabled={isSaving}>
            ביטול
          </CancelButton>
        )}
      </Actions>
    </Form>
  );
}