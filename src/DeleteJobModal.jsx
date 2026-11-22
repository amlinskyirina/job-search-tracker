import { useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";

const Dialog = styled.dialog`
  box-sizing: border-box;
  width: min(420px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid #ccd9ee;
  border-radius: 14px;
  background: #fff;
  color: #0f2044;
  text-align: start;
  overflow-wrap: anywhere;

  &::backdrop {
    background: #0f172a80;
  }

  h2 {
    margin: 0 0 12px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;

  button {
    min-height: 44px;
    padding: 8px 16px;
    border: 1px solid #bac9dc;
    border-radius: 8px;
    background: #fff;
    color: #0f2044;
    font: inherit;
    cursor: pointer;
  }

  button[data-action="confirm"] {
    border-color: #b91c1c;
    background: #b91c1c;
    color: #fff;
  }

  button:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  button:focus-visible {
    outline: 2px solid #087f83;
    outline-offset: 2px;
  }
`;

const ErrorMessage = styled.p`
  color: #b91c1c;
`;

export default function DeleteJobModal({
  jobTitle,
  onCancel,
  onConfirm,
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    mountedRef.current = true;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;

    if (!dialog.open) {
      dialog.showModal();
    }

    cancelButtonRef.current?.focus();

    return () => {
      mountedRef.current = false;

      if (dialog.open) {
        dialog.close();
      }

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, []);

  function handleCancel() {
    if (submittingRef.current) return;

    onCancel();
  }

  async function handleConfirm() {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const success = await onConfirm();

      if (success === false && mountedRef.current) {
        setErrorMessage(
          "המחיקה נכשלה. בדקי את החיבור ונסי שוב.",
        );
      }
    } catch (error) {
      console.error(
        "אישור המחיקה נכשל",
        error?.code ?? error?.name,
      );

      if (mountedRef.current) {
        setErrorMessage(
          "המחיקה נכשלה. בדקי את החיבור ונסי שוב.",
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setIsDeleting(false);
      }
    }
  }

  return (
    <Dialog
      ref={dialogRef}
      dir="rtl"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={isDeleting}
      onCancel={(event) => {
        event.preventDefault();
        handleCancel();
      }}
    >
      <h2 id={titleId}>מחיקת משרה</h2>

      <p id={descriptionId}>
        האם למחוק את המשרה ״<bdi>{jobTitle}</bdi>״?
      </p>

      {isDeleting && (
        <p role="status">ממתינה לאישור המחיקה מהענן...</p>
      )}

      {errorMessage && (
        <ErrorMessage role="alert">
          {errorMessage}
        </ErrorMessage>
      )}

      <Actions>
        <button
          ref={cancelButtonRef}
          type="button"
          disabled={isDeleting}
          onClick={handleCancel}
        >
          ביטול
        </button>

        <button
          type="button"
          data-action="confirm"
          disabled={isDeleting}
          onClick={handleConfirm}
        >
          {isDeleting ? "מוחקת..." : "מחיקה"}
        </button>
      </Actions>
    </Dialog>
  );
}